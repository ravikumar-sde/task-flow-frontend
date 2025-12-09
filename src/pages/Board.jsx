import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal, X, ArrowLeft, Settings, Trash2, Edit2 } from 'lucide-react';
import boardService from '../services/boardService';
import listService from '../services/listService';
import workspaceService from '../services/workspaceService';
import cardService from '../services/cardService';
import CardModal from '../components/CardModal';
import Card from '../components/Card';
import FilterBar from '../components/FilterBar';
import NotificationModal from '../components/NotificationModal';
import { useNotification } from '../hooks/useNotification';
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
  const [workspace, setWorkspace] = useState(null);
  const [cards, setCards] = useState({});
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [addingCardToStage, setAddingCardToStage] = useState(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [creatingCard, setCreatingCard] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [filters, setFilters] = useState({
    labels: [],
    members: [],
    dueDate: null,
    search: ''
  });
  const [showBoardSettings, setShowBoardSettings] = useState(false);
  const [editingBoardName, setEditingBoardName] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');

  const {
    notification,
    closeNotification,
    showError,
    showConfirm
  } = useNotification();

  console.log('Board component - URL params:', { workspaceId, boardId });

  useEffect(() => {
    console.log('Board useEffect - boardId:', boardId);
    if (boardId) {
      fetchBoardData();
    } else {
      console.error('Board component - boardId is undefined!');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  useEffect(() => {
    if (workspaceId) {
      fetchWorkspaceData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const fetchWorkspaceData = async () => {
    try {
      const [workspaceData, membersData] = await Promise.all([
        workspaceService.getWorkspaceById(workspaceId),
        workspaceService.getWorkspaceMembers(workspaceId)
      ]);
      setWorkspace(workspaceData.data);
      setWorkspaceMembers(membersData.data || []);
    } catch (error) {
      console.error('Failed to fetch workspace data:', error);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuId) {
        setOpenMenuId(null);
      }
      if (showBoardSettings) {
        setShowBoardSettings(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId, showBoardSettings]);

  const fetchBoardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching board data for boardId:', boardId);

      const [boardResponse, listsResponse, cardsResponse] = await Promise.all([
        boardService.getBoardById(boardId),
        listService.getBoardLists(boardId),
        cardService.getBoardCards(boardId)
      ]);

      console.log('✅ Board data fetched:', boardResponse);
      console.log('✅ Lists data fetched:', listsResponse);
      console.log('✅ Cards data fetched:', cardsResponse);

      setBoard(boardResponse.data || boardResponse);
      const listsData = listsResponse.data || [];
      setLists(listsData);

      // Organize cards by stage
      const cardsData = cardsResponse.data || [];
      console.log('📊 Processing cards:', cardsData);
      console.log('📊 Total cards fetched:', cardsData.length);

      const cardsByStage = {};
      listsData.forEach(list => {
        const stageId = list._id || list.id;
        const stageCards = cardsData.filter(card => {
          const cardStageId = card.stageId?._id || card.stageId;
          return cardStageId === stageId;
        });
        cardsByStage[stageId] = stageCards;
        console.log(`📋 Stage "${list.name}" (${stageId}): ${stageCards.length} cards`);
      });

      setCards(cardsByStage);
      console.log('✅ Cards organized by stage:', cardsByStage);
    } catch (error) {
      console.error('❌ Failed to fetch board data:', error);
      console.error('❌ Error details:', error.response?.data);
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

    const { source, destination, type } = result;

    if (type === 'list') {
      // Reorder lists
      const reorderedLists = Array.from(lists);
      const [removed] = reorderedLists.splice(source.index, 1);
      reorderedLists.splice(destination.index, 0, removed);

      setLists(reorderedLists);

      // Update positions on backend
      try {
        const stageOrders = reorderedLists.map((list, index) => ({
          stageId: list._id || list.id,
          position: index
        }));

        await listService.reorderStages(boardId, stageOrders);
      } catch (error) {
        console.error('Failed to update list position:', error);
        setLists(lists);
      }
    } else if (type === 'card') {
      // Handle card drag and drop
      const sourceStageId = source.droppableId;
      const destStageId = destination.droppableId;

      const sourceCards = Array.from(cards[sourceStageId] || []);
      const destCards = sourceStageId === destStageId ? sourceCards : Array.from(cards[destStageId] || []);

      const [movedCard] = sourceCards.splice(source.index, 1);

      if (sourceStageId === destStageId) {
        // Moving within same stage
        sourceCards.splice(destination.index, 0, movedCard);
        setCards({
          ...cards,
          [sourceStageId]: sourceCards
        });
      } else {
        // Moving to different stage
        destCards.splice(destination.index, 0, movedCard);
        setCards({
          ...cards,
          [sourceStageId]: sourceCards,
          [destStageId]: destCards
        });
      }

      // Update on backend
      try {
        await cardService.moveCard(movedCard._id || movedCard.id, destStageId, destination.index);
      } catch (error) {
        console.error('Failed to move card:', error);
        // Revert on error
        fetchBoardData();
      }
    }
  };

  const handleDeleteList = (listId) => {
    const listName = lists.find(l => (l._id || l.id) === listId)?.name || 'this list';
    showConfirm(
      `Are you sure you want to delete "${listName}"? All cards in this list will be deleted.`,
      async () => {
        try {
          await listService.deleteList(listId);
          setLists(lists.filter(list => (list._id || list.id) !== listId));
          setOpenMenuId(null);
        } catch (error) {
          console.error('Failed to delete list:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Failed to delete list. Please try again.';
          showError(errorMessage);
        }
      },
      'Delete List',
      'Delete',
      'Cancel'
    );
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

  // Card handlers
  const handleAddCard = (stageId) => {
    setAddingCardToStage(stageId);
    setNewCardTitle('');
  };

  const handleCreateCard = async (e, stageId) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    if (creatingCard) return; // Prevent double submission

    try {
      setCreatingCard(true);
      const cardData = {
        title: newCardTitle,
        stageId,
        description: '',
        priority: 'medium',
        assignedTo: []
      };

      console.log('📝 Creating card via API (quick add):', cardData);
      console.log('Stage ID:', stageId);

      const response = await cardService.createCard(cardData);
      console.log('✅ Full API Response:', response);

      // Handle different response structures
      const newCard = response.data?.card || response.card || response.data || response;
      console.log('✅ Extracted card:', newCard);

      if (!newCard || (!newCard._id && !newCard.id)) {
        console.error('❌ Invalid card response:', newCard);
        throw new Error('Invalid response from server');
      }

      // Update cards state
      setCards(prevCards => ({
        ...prevCards,
        [stageId]: [...(prevCards[stageId] || []), newCard]
      }));

      console.log('✅ Card added to UI successfully');
      setNewCardTitle('');
      setAddingCardToStage(null);
    } catch (error) {
      console.error('❌ Failed to create card:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create card. Please try again.';
      alert(`Error: ${errorMessage}`);
    } finally {
      setCreatingCard(false);
    }
  };

  const handleCardClick = (card, stageId) => {
    setSelectedCard(card);
    setSelectedStageId(stageId);
    setShowCardModal(true);
  };

  const handleCardUpdate = (updatedCard) => {
    const stageId = selectedStageId;
    setCards({
      ...cards,
      [stageId]: (cards[stageId] || []).map(c =>
        (c._id || c.id) === (updatedCard._id || updatedCard.id) ? updatedCard : c
      )
    });
  };

  const handleCardDelete = (cardId) => {
    const stageId = selectedStageId;
    setCards({
      ...cards,
      [stageId]: (cards[stageId] || []).filter(c => (c._id || c.id) !== cardId)
    });
  };

  const handleUpdateBoardName = async () => {
    if (!newBoardName.trim() || newBoardName === board.name) {
      setEditingBoardName(false);
      return;
    }

    try {
      const response = await boardService.updateBoard(boardId, { name: newBoardName });
      setBoard({ ...board, name: newBoardName });
      setEditingBoardName(false);
      console.log('✅ Board name updated:', response);
    } catch (error) {
      console.error('Failed to update board name:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update board name. Please try again.';
      showError(errorMessage);
      setEditingBoardName(false);
    }
  };

  const handleDeleteBoard = () => {
    showConfirm(
      `Are you sure you want to delete "${board.name}"? This action cannot be undone.`,
      async () => {
        try {
          await boardService.deleteBoard(boardId);
          console.log('✅ Board deleted successfully');
          navigate(workspaceId ? `/workspace/${workspaceId}` : '/dashboard');
        } catch (error) {
          console.error('Failed to delete board:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Failed to delete board. Please try again.';
          showError(errorMessage);
        }
      },
      'Delete Board',
      'Delete',
      'Cancel'
    );
  };

  const handleOpenBoardSettings = () => {
    setNewBoardName(board.name);
    setShowBoardSettings(!showBoardSettings);
  };

  // Filter cards based on active filters
  const filterCards = (cardsToFilter) => {
    return cardsToFilter.filter(card => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const titleMatch = card.title?.toLowerCase().includes(searchLower);
        const descriptionMatch = card.description?.toLowerCase().includes(searchLower);
        if (!titleMatch && !descriptionMatch) return false;
      }

      // Label filter
      if (filters.labels.length > 0) {
        const hasMatchingLabel = card.labels?.some(label => filters.labels.includes(label));
        if (!hasMatchingLabel) return false;
      }

      // Member filter
      if (filters.members.length > 0) {
        const cardMemberIds = card.assignedTo?.map(m => m._id || m.id || m) || [];
        const hasMatchingMember = cardMemberIds.some(memberId => filters.members.includes(memberId));
        if (!hasMatchingMember) return false;
      }

      // Due date filter
      if (filters.dueDate) {
        if (!card.dueDate) return false;

        const cardDueDate = new Date(card.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const cardDate = new Date(cardDueDate);
        cardDate.setHours(0, 0, 0, 0);

        if (filters.dueDate === 'overdue') {
          if (cardDate >= today) return false;
        } else if (filters.dueDate === 'today') {
          if (cardDate.getTime() !== today.getTime()) return false;
        } else if (filters.dueDate === 'tomorrow') {
          if (cardDate.getTime() !== tomorrow.getTime()) return false;
        }
      }

      return true;
    });
  };

  // Get all unique labels from all cards
  const getAllLabels = () => {
    const labelsSet = new Set();
    Object.values(cards).forEach(stageCards => {
      stageCards.forEach(card => {
        if (card.labels) {
          card.labels.forEach(label => labelsSet.add(label));
        }
      });
    });
    return Array.from(labelsSet);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
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
        <div className="board-header-left">
          <button
            className="board-back-btn"
            onClick={() => navigate(workspaceId ? `/workspace/${workspaceId}` : '/dashboard')}
            title="Back to workspace"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="board-title-section">
            {editingBoardName ? (
              <div className="board-title-edit">
                <input
                  type="text"
                  className="board-title-input"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateBoardName();
                    } else if (e.key === 'Escape') {
                      setEditingBoardName(false);
                    }
                  }}
                  onBlur={handleUpdateBoardName}
                  autoFocus
                />
              </div>
            ) : (
              <h1 className="board-title">{board.name}</h1>
            )}
            {workspace && (
              <span className="workspace-name-badge">{workspace.name}</span>
            )}
          </div>
        </div>
        <div className="board-header-right">
          <div className="board-settings-wrapper">
            <button
              className="board-header-btn settings-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenBoardSettings();
              }}
              title="Board settings"
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>
            {showBoardSettings && (
              <div className="board-settings-dropdown">
                <button
                  className="settings-menu-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowBoardSettings(false);
                    setEditingBoardName(true);
                  }}
                >
                  <Edit2 size={14} />
                  <span>Rename Board</span>
                </button>
                <button
                  className="settings-menu-item delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowBoardSettings(false);
                    handleDeleteBoard();
                  }}
                >
                  <Trash2 size={14} />
                  <span>Delete Board</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="board-filter-section">
        <FilterBar
          onFilterChange={handleFilterChange}
          availableLabels={getAllLabels()}
          availableMembers={workspaceMembers}
          activeFilters={filters}
        />
      </div>

      <div className="board-content">
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

                        <Droppable droppableId={list._id || list.id} type="card">
                          {(provided) => (
                            <div
                              className="list-cards"
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                            >
                              {filterCards(cards[list._id || list.id] || []).map((card, cardIndex) => (
                                <Draggable
                                  key={card._id || card.id}
                                  draggableId={card._id || card.id}
                                  index={cardIndex}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={snapshot.isDragging ? 'dragging' : ''}
                                    >
                                      <Card
                                        card={card}
                                        onClick={() => handleCardClick(card, list._id || list.id)}
                                      />
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>

                        <div className="list-footer">
                          {addingCardToStage === (list._id || list.id) ? (
                            <form onSubmit={(e) => handleCreateCard(e, list._id || list.id)} className="add-card-form">
                              <input
                                type="text"
                                className="add-card-input"
                                placeholder="Enter a title or paste a link"
                                value={newCardTitle}
                                onChange={(e) => setNewCardTitle(e.target.value)}
                                autoFocus
                              />
                              <div className="add-card-actions">
                                <button type="submit" className="btn-add-card" disabled={!newCardTitle.trim() || creatingCard}>
                                  {creatingCard ? 'Adding...' : 'Add card'}
                                </button>
                                <button
                                  type="button"
                                  className="btn-cancel-card"
                                  onClick={() => setAddingCardToStage(null)}
                                >
                                  <X size={20} />
                                </button>
                              </div>
                            </form>
                          ) : (
                            <button className="add-card-btn" onClick={() => handleAddCard(list._id || list.id)}>
                              <Plus size={16} />
                              <span>Add a card</span>
                            </button>
                          )}
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

      {/* Card Modal */}
      {showCardModal && (
        <CardModal
          card={selectedCard}
          stageId={selectedStageId}
          stageName={lists.find(l => (l._id || l.id) === selectedStageId)?.name || ''}
          workspaceId={workspaceId}
          onClose={() => {
            setShowCardModal(false);
            setSelectedCard(null);
            setSelectedStageId(null);
          }}
          onUpdate={handleCardUpdate}
          onDelete={handleCardDelete}
        />
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        onConfirm={notification.onConfirm}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        confirmText={notification.confirmText}
        cancelText={notification.cancelText}
        showCancel={notification.showCancel}
      />
    </div>
  );
};

export default Board;

