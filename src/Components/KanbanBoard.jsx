import React, { useEffect, useState } from 'react';
import './KanbanBoard.css';

// Importing all icons as React components
import { InProgress } from '../Assets/InProgress';
import { ToDo } from '../Assets/ToDo';
import { Backlog } from '../Assets/Backlog';
import { Cancelled } from '../Assets/Cancelled';
import { Done } from '../Assets/Done';
import { Display } from '../Assets/Display';
import { UrgentPrioritygrey } from '../Assets/UrgentPrioritygrey';
import { HighPriority } from '../Assets/HighPriority';
import { MediumPriority } from '../Assets/MediumPriority';
import { LowPriority } from '../Assets/LowPriority';
import { NoPriority } from '../Assets/NoPriority';
import { Add } from '../Assets/Add';
import { ThreeDotMenu } from '../Assets/ThreeDotMenu';

const KanbanBoard = () => {
  const [tickets, setTickets] = useState([]);
  const [groupBy, setGroupBy] = useState('status');
  const [sortBy, setSortBy] = useState('priority');
  const [users, setUsers] = useState([]);
  const [displayDropdownVisible, setDisplayDropdownVisible] = useState(false);

  useEffect(() => {
    fetch('https://api.quicksell.co/v1/internal/frontend-assignment')
      .then((response) => response.json())
      .then((data) => {
        setTickets(data.tickets);
        setUsers(data.users);
      });
  }, []);

  useEffect(() => {
    const savedGroupBy = localStorage.getItem('groupBy');
    const savedSortBy = localStorage.getItem('sortBy');

    if (savedGroupBy) {
      setGroupBy(savedGroupBy);
    }
    if (savedSortBy) {
      setSortBy(savedSortBy);
    }
  }, []);

  const handleGroupByChange = (e) => {
    const newGroupBy = e.target.value;
    setGroupBy(newGroupBy);
    localStorage.setItem('groupBy', newGroupBy); // User current choices saved to localStorage
  };

  const handleSortByChange = (e) => {
    const newSortBy = e.target.value;
    setSortBy(newSortBy);
    localStorage.setItem('sortBy', newSortBy);
  };

  const groupTickets = (tickets) => {
    switch (groupBy) {
      case 'status':
        return tickets.reduce((groups, ticket) => {
          (groups[ticket.status] = groups[ticket.status] || []).push(ticket);
          return groups;
        }, {});
      case 'user':
        return tickets.reduce((groups, ticket) => {
          const user = users.find((user) => user.id === ticket.userId);
          (groups[user?.name || 'Unassigned'] = groups[user?.name || 'Unassigned'] || []).push(ticket);
          return groups;
        }, {});
      case 'priority':
        return tickets.reduce((groups, ticket) => {
          const priorityLevel = getPriorityLevel(ticket.priority);
          (groups[priorityLevel] = groups[priorityLevel] || []).push(ticket);
          return groups;
        }, {});
      default:
        return {};
    }
  };

  const getPriorityLevel = (priority) => {
    switch (priority) {
      case 4: return 'Urgent';
      case 3: return 'High';
      case 2: return 'Medium';
      case 1: return 'Low';
      case 0: return 'No Priority';
      default: return 'No Priority';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'Urgent': return <UrgentPrioritygrey />;
      case 'High': return <HighPriority />;
      case 'Medium': return <MediumPriority />;
      case 'Low': return <LowPriority />;
      case 'No Priority': return <NoPriority />;
      default: return null;
    }
  };

  const groupedTickets = groupTickets(tickets);

  // Helper function to get the count of tickets in a group
  const getTicketCount = (group) => {
    return groupedTickets[group] ? groupedTickets[group].length : 0;
  };

  return (
    <div className="kanban-board">
      <div className="kanban-controls">
        <button onClick={() => setDisplayDropdownVisible(!displayDropdownVisible)} className="display-dropdown-button">
          <Display className="display-icon" />
          <span className="display-text">Display</span>
        </button>

        {displayDropdownVisible && (
          <div className="display-dropdown-menu">
            <select onChange={handleGroupByChange} value={groupBy}>
              <option value="status">Group by Status</option>
              <option value="user">Group by User</option>
              <option value="priority">Group by Priority</option>
            </select>
            <select onChange={handleSortByChange} value={sortBy}>
              <option value="priority">Sort by Priority</option>
              <option value="title">Sort by Title</option>
            </select>
          </div>
        )}
      </div>

      <div className="kanban-columns">
        {Object.keys(groupedTickets).map((group) => (
          <div key={group} className="kanban-column">
            <div className="column-heading">
              <h2>
                {group === 'Todo' && <ToDo className="status-icon" />}
                {group === 'In progress' && <InProgress className="status-icon" />}
                {group === 'Backlog' && <Backlog className="status-icon" />}
                {group === 'Cancelled' && <Cancelled className="status-icon" />}
                {group === 'Done' && <Done className="status-icon" />}
                {groupBy === 'priority' && getPriorityIcon(group)}
                {group}
              </h2>
              <span className="ticket-count">{getTicketCount(group)}</span>
              
              <div className="icon-buttons">
                <button className="add-ticket-button">
                  <Add className="add-icon" />
                </button>
                <button className="menu-button">
                  <ThreeDotMenu className="three-dot-menu" />
                </button>
              </div>
            </div>

            {groupedTickets[group]
              .sort((a, b) => {
                if (sortBy === 'priority') return b.priority - a.priority;
                if (sortBy === 'title') return a.title.localeCompare(b.title);
                return 0;
              })
              .map((ticket) => (
                <div key={ticket.id} className="kanban-ticket">
                  <div className="kanban-ticket-header">
                    <p className="ticket-id">{ticket.id}</p>
                    <h4 className="ticket-title">{ticket.title}</h4>
                    <div className="menu-container">
                      {getPriorityIcon(getPriorityLevel(ticket.priority))}
                      <p className="ticket-tag">{ticket.tag}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
