import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal, X } from 'lucide-react';
import boardService from '../services/boardService';
import listService from '../services/listService';
import '../styles/Board.css';

const Board = () => {
  const { workspaceId, boardId } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddList, setShowAddList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [creatingList, setCreatingList] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingListId, setEditingListId] = useState(null);
  const [editingListName, setEditingListName] = useState('');

  console.log('Board component - URL params:', { workspaceId, boardId });

  useEffect(() => {
    console.log('Board useEffect - boardId:', boardId);
    if (boardId) {
      fetchBoardData();
    } else {
      console.error('Board component - boardId is undefined!');
    }
  }, [boardId]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuId) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  const fetchBoardData = async () => {
    try {
      setLoading(true);
      const [boardResponse, listsResponse] = await Promise.all([
        boardService.getBoardById(boardId),
        listService.getBoardLists(boardId)
      ]);
      
      console.log('Board data:', boardResponse);
      console.log('Lists data:', listsResponse);
      
      setBoard(boardResponse.data || boardResponse);
      setLists(listsResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch board data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    try {
      setCreatingList(true);
      const response = await listService.createList({
        boardId,
        name: newListTitle,
        position: lists.length
      });
      
      console.log('Created list:', response);
      setLists([...lists, response.data || response]);
      setNewListTitle('');
      setShowAddList(false);
    } catch (error) {
      console.error('Failed to create list:', error);
    } finally {
      setCreatingList(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Reorder lists
    const reorderedLists = Array.from(lists);
    const [removed] = reorderedLists.splice(source.index, 1);
    reorderedLists.splice(destination.index, 0, removed);

    setLists(reorderedLists);

    // Update positions on backend
    try {
      // Create stage orders array with updated positions
      const stageOrders = reorderedLists.map((list, index) => ({
        stageId: list._id || list.id,
        position: index
      }));

      await listService.reorderStages(boardId, stageOrders);
    } catch (error) {
      console.error('Failed to update list position:', error);
      // Revert on error
      setLists(lists);
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm('Are you sure you want to delete this list?')) return;

    try {
      await listService.deleteList(listId);
      setLists(lists.filter(list => (list._id || list.id) !== listId));
      setOpenMenuId(null);
    } catch (error) {
      console.error('Failed to delete list:', error);
    }
  };

  const handleEditList = (list) => {
    setEditingListId(list._id || list.id);
    setEditingListName(list.name);
    setOpenMenuId(null);
  };

  const handleUpdateList = async (listId) => {
    // If already not editing, return early
    if (editingListId !== listId) return;

    if (!editingListName.trim()) {
      handleCancelEdit();
      return;
    }

    try {
      console.log('Updating list:', listId, 'with name:', editingListName);
      const response = await listService.updateList(listId, { name: editingListName });
      console.log('Update list response:', response);

      // The response structure might be { data: { stage } } or { stage } or just the stage object
      const updatedStage = response.data?.stage || response.stage || response.data || response;
      const newName = updatedStage.name || editingListName;

      console.log('Extracted name:', newName);

      // Update the list in state with the new name
      setLists(prevLists => prevLists.map(list =>
        (list._id || list.id) === listId
          ? { ...list, name: newName }
          : list
      ));

      setEditingListId(null);
      setEditingListName('');
    } catch (error) {
      console.error('Failed to update list:', error);
      alert('Failed to update list. Please try again.');
      handleCancelEdit();
    }
  };

  const handleCancelEdit = () => {
    setEditingListId(null);
    setEditingListName('');
  };

  if (loading) {
    return (
      <div className="board-loading">
        <div className="spinner"></div>
        <p>Loading board...</p>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="board-error">
        <p>Board not found</p>
        <button onClick={() => navigate(workspaceId ? `/workspace/${workspaceId}` : '/dashboard')}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="board-container" style={{ backgroundColor: board.backgroundColor || '#0079BF' }}>
      <div className="board-header">
        <div className="board-header-content">
          <div className="board-header-left">
            <h1 className="board-title">{board.name}</h1>
          </div>
          <div className="board-header-right">
            <button
              className="board-header-btn"
              onClick={() => navigate(workspaceId ? `/workspace/${workspaceId}` : '/dashboard')}
            >
              Back
            </button>
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="board" direction="horizontal" type="list">
          {(provided) => (
            <div
              className="board-lists"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {lists.map((list, index) => (
                <Draggable
                  key={list._id || list.id}
                  draggableId={list._id || list.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`board-list ${snapshot.isDragging ? 'dragging' : ''}`}
                    >
                      <div className="list-header">
                        {editingListId === (list._id || list.id) ? (
                          <div className="list-title-edit">
                            <input
                              type="text"
                              value={editingListName}
                              onChange={(e) => setEditingListName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleUpdateList(list._id || list.id);
                                } else if (e.key === 'Escape') {
                                  e.preventDefault();
                                  handleCancelEdit();
                                }
                              }}
                              onBlur={() => {
                                // Only update if we're still in edit mode
                                if (editingListId === (list._id || list.id)) {
                                  handleUpdateList(list._id || list.id);
                                }
                              }}
                              autoFocus
                              className="list-title-input"
                            />
                          </div>
                        ) : (
                          <div className="list-title-wrapper" {...provided.dragHandleProps}>
                            <h3 className="list-title">{list.name}</h3>
                          </div>
                        )}
                        <div className="list-menu">
                          <button
                            className="list-menu-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === (list._id || list.id) ? null : (list._id || list.id));
                            }}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          {openMenuId === (list._id || list.id) && (
                            <div className="list-menu-dropdown">
                              <button
                                className="menu-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditList(list);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="menu-item delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteList(list._id || list.id);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="list-cards">
                        {/* Cards will be added here later */}
                      </div>

                      <div className="list-footer">
                        <button className="add-card-btn">
                          <Plus size={16} />
                          <span>Add a card</span>
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}

              {/* Add List Button */}
              {showAddList ? (
                <div className="board-list add-list-form">
                  <form onSubmit={handleCreateList}>
                    <input
                      type="text"
                      className="add-list-input"
                      placeholder="Enter list title..."
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      autoFocus
                      disabled={creatingList}
                    />
                    <div className="add-list-actions">
                      <button
                        type="submit"
                        className="btn-add-list"
                        disabled={creatingList || !newListTitle.trim()}
                      >
                        Add list
                      </button>
                      <button
                        type="button"
                        className="btn-cancel-list"
                        onClick={() => {
                          setShowAddList(false);
                          setNewListTitle('');
                        }}
                        disabled={creatingList}
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <button
                  className="board-list add-list-btn"
                  onClick={() => setShowAddList(true)}
                >
                  <Plus size={20} />
                  <span>Add another list</span>
                </button>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default Board;

