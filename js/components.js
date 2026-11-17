// Specter's Checklist: icons, toasts, modals, menus and the HTML for sections and items

const Icons = {
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>`,
    plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>`,
    chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>`,
    chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>`,
    edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>`,
    duplicate: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`,
    move: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/></svg>`,
    tag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
    calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    flag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`,
    repeat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17,1 21,5 17,9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7,23 3,19 7,15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>`,
    folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>`,
    folderPlus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>`,
    checkAll: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L7 17l-4-4"/><path d="M22 10l-7.5 7.5L13 16"/></svg>`,
    uncheckAll: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`,
    download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
    palette: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/></svg>`,
    grip: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>`,
    note: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`,
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>`,
    settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
    refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>`,
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>`,
    error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    undo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6M3 13c0-4.97 4.03-9 9-9a9 9 0 016.36 2.64"/></svg>`,
    redo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 7v6h-6M21 13c0-4.97-4.03-9-9-9a9 9 0 00-6.36 2.64"/></svg>`,
    chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>`,
    fire: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>`,
    arrowUp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5,12 12,5 19,12"/></svg>`,
    arrowDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19,12 12,19 5,12"/></svg>`,
    chevronLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15,18 9,12 15,6"/></svg>`
};

// ---- Toast notification ----
const Toast = {
    container: null,

    init() {
        this.container = document.getElementById('toastContainer');
    },

    show(options) {
        const { type = 'info', title, message, duration = 4000, action, actionText = 'Undo' } = options;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        toast.innerHTML = `
            <span class="toast-icon">${Icons[type] || Icons.info}</span>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                ${message ? `<div class="toast-message">${message}</div>` : ''}
            </div>
            ${action ? `<button class="toast-action">${actionText}</button>` : ''}
            <button class="toast-close">${Icons.close}</button>
        `;

        toast.querySelector('.toast-close').addEventListener('click', () => this.remove(toast));

        if (action) {
            toast.querySelector('.toast-action').addEventListener('click', () => {
                action();
                this.remove(toast);
            });
        }

        this.container.appendChild(toast);

        if (duration > 0) {
            setTimeout(() => this.remove(toast), duration);
        }

        return toast;
    },

    remove(toast) {
        if (!toast || !toast.parentNode) return;
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    },

    success(message, options = {}) {
        return this.show({ type: 'success', message, ...options });
    },

    error(message, options = {}) {
        return this.show({ type: 'error', message, ...options });
    },

    warning(message, options = {}) {
        return this.show({ type: 'warning', message, ...options });
    },

    info(message, options = {}) {
        return this.show({ type: 'info', message, ...options });
    }
};

// ---- Modal ----
const Modal = {
    overlay: null,
    modal: null,
    titleEl: null,
    bodyEl: null,
    footerEl: null,
    closeBtn: null,
    onClose: null,

    init() {
        this.overlay = document.getElementById('modalOverlay');
        this.modal = document.getElementById('modal');
        this.titleEl = document.getElementById('modalTitle');
        this.bodyEl = document.getElementById('modalBody');
        this.footerEl = document.getElementById('modalFooter');
        this.closeBtn = document.getElementById('modalClose');

        this.closeBtn.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.classList.contains('visible')) {
                this.close();
            }
        });
    },

    open(options) {
        const { title, body, footer, onClose, width } = options;

        this.titleEl.textContent = title || '';
        this.bodyEl.innerHTML = typeof body === 'string' ? body : '';
        if (typeof body !== 'string' && body) {
            this.bodyEl.innerHTML = '';
            this.bodyEl.appendChild(body);
        }

        this.footerEl.innerHTML = '';
        if (footer) {
            if (typeof footer === 'string') {
                this.footerEl.innerHTML = footer;
            } else {
                this.footerEl.appendChild(footer);
            }
        }

        if (width) {
            this.modal.style.maxWidth = width;
        } else {
            this.modal.style.maxWidth = '';
        }

        this.onClose = onClose;
        this.overlay.classList.add('visible');

        const firstInput = this.bodyEl.querySelector('input, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    },

    close() {
        this.overlay.classList.remove('visible');
        if (this.onClose) this.onClose();
        this.onClose = null;
    },

    confirm(options) {
        return new Promise((resolve) => {
            const { title, message, confirmText = 'Confirm', cancelText = 'Cancel', danger = false } = options;
            let resolved = false;

            const footer = document.createElement('div');
            footer.className = 'modal-actions';

            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn btn-secondary';
            cancelBtn.textContent = cancelText;
            cancelBtn.addEventListener('click', () => {
                if (resolved) return;
                resolved = true;
                this.onClose = null;
                this.close();
                resolve(false);
            });

            const confirmBtn = document.createElement('button');
            confirmBtn.className = danger ? 'btn btn-danger' : 'btn btn-primary';
            confirmBtn.textContent = confirmText;
            confirmBtn.addEventListener('click', () => {
                if (resolved) return;
                resolved = true;
                this.onClose = null;
                this.close();
                resolve(true);
            });

            footer.appendChild(cancelBtn);
            footer.appendChild(confirmBtn);

            this.open({
                title,
                body: `<p class="modal-hint">${message}</p>`,
                footer,
                onClose: () => {
                    if (resolved) return;
                    resolved = true;
                    resolve(false);
                }
            });
        });
    },

    prompt(options) {
        return new Promise((resolve) => {
            const { title, message, placeholder = '', defaultValue = '', inputType = 'text' } = options;
            let resolved = false;

            const body = document.createElement('div');
            if (message) {
                const p = document.createElement('p');
                p.className = 'modal-hint';
                p.textContent = message;
                body.appendChild(p);
            }

            const input = document.createElement(inputType === 'textarea' ? 'textarea' : 'input');
            input.className = inputType === 'textarea' ? 'form-input form-textarea' : 'form-input';
            input.placeholder = placeholder;
            input.value = defaultValue;
            if (inputType !== 'textarea') input.type = inputType;
            body.appendChild(input);

            const footer = document.createElement('div');
            footer.className = 'modal-actions';

            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn btn-secondary';
            cancelBtn.textContent = 'Cancel';
            cancelBtn.addEventListener('click', () => {
                if (resolved) return;
                resolved = true;
                this.onClose = null;
                this.close();
                resolve(null);
            });

            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'btn btn-primary';
            confirmBtn.textContent = 'OK';
            confirmBtn.addEventListener('click', () => {
                if (resolved) return;
                resolved = true;
                this.onClose = null;
                this.close();
                resolve(input.value);
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && inputType !== 'textarea') {
                    if (resolved) return;
                    resolved = true;
                    this.onClose = null;
                    this.close();
                    resolve(input.value);
                }
            });

            footer.appendChild(cancelBtn);
            footer.appendChild(confirmBtn);

            this.open({
                title,
                body,
                footer,
                onClose: () => {
                    if (resolved) return;
                    resolved = true;
                    resolve(null);
                }
            });
        });
    }
};

// ---- Context menu ----
const ContextMenu = {
    menu: null,
    content: null,
    visible: false,
    currentTarget: null,

    init() {
        this.menu = document.getElementById('contextMenu');
        this.content = this.menu.querySelector('.context-menu-content');

        document.addEventListener('click', () => this.hide());
        document.addEventListener('contextmenu', (e) => {
            if (!this.menu.contains(e.target)) {
                this.hide();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hide();
        });
    },

    show(x, y, items, target = null) {
        this.currentTarget = target;
        this.content.innerHTML = '';

        items.forEach(item => {
            if (item.divider) {
                const divider = document.createElement('div');
                divider.className = 'context-menu-divider';
                this.content.appendChild(divider);
                return;
            }

            const menuItem = document.createElement('div');
            menuItem.className = 'context-menu-item' + (item.danger ? ' danger' : '');

            menuItem.innerHTML = `
                ${item.icon ? `<span>${Icons[item.icon] || ''}</span>` : ''}
                <span>${item.label}</span>
                ${item.shortcut ? `<kbd>${item.shortcut}</kbd>` : ''}
            `;

            if (item.action) {
                menuItem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.hide();
                    item.action(this.currentTarget);
                });
            }

            this.content.appendChild(menuItem);
        });

        const menuRect = this.menu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // keep the menu inside the window
        if (x + 220 > viewportWidth) {
            x = viewportWidth - 220;
        }
        if (y + this.content.offsetHeight > viewportHeight) {
            y = viewportHeight - this.content.offsetHeight - 10;
        }

        this.menu.style.left = `${x}px`;
        this.menu.style.top = `${y}px`;
        this.menu.classList.add('visible');
        this.visible = true;
    },

    hide() {
        this.menu.classList.remove('visible');
        this.visible = false;
        this.currentTarget = null;
    }
};

// ---- Section ----
function renderSection(section, depth = 0) {
    const progress = DataManager.getSectionProgress(section.id);

    const sectionEl = document.createElement('div');
    sectionEl.className = 'section' + (section.collapsed ? ' collapsed' : '');
    sectionEl.dataset.id = section.id;
    sectionEl.dataset.depth = depth;

    sectionEl.innerHTML = `
        <div class="section-header" data-section-id="${section.id}">
            <button class="section-collapse-btn" title="Collapse/Expand">
                ${Icons.chevronDown}
            </button>
            <div class="section-color-indicator" style="background: ${section.color}"></div>
            <h3 class="section-title">${escapeHtml(section.name)}</h3>
            <div class="section-progress">
                <div class="section-progress-bar">
                    <div class="section-progress-fill" style="width: ${progress.percentage}%"></div>
                </div>
                <span class="section-progress-text">${progress.completed}/${progress.total}</span>
            </div>
            <div class="section-actions">
                <button class="section-action-btn" data-action="add-item" title="Add Item">
                    ${Icons.plus}
                </button>
                <button class="section-action-btn" data-action="add-subsection" title="Add Subsection">
                    ${Icons.folderPlus}
                </button>
                <button class="section-action-btn" data-action="edit" title="Edit Section">
                    ${Icons.edit}
                </button>
            </div>
        </div>
        <div class="section-content">
            <div class="section-items" data-section-id="${section.id}">
            </div>
            <div class="section-children">
            </div>
            <button class="add-item-btn" data-section-id="${section.id}">
                ${Icons.plus}
                <span>Add item</span>
            </button>
        </div>
    `;

    const itemsContainer = sectionEl.querySelector('.section-items');
    section.items.forEach(item => {
        itemsContainer.appendChild(renderItem(item, section.id));
    });

    const childrenContainer = sectionEl.querySelector('.section-children');
    section.children.forEach(child => {
        childrenContainer.appendChild(renderSection(child, depth + 1));
    });

    return sectionEl;
}

// ---- Checklist item ----
function renderItem(item, sectionId) {
    const itemEl = document.createElement('div');
    itemEl.className = 'checklist-item' + (item.completed ? ' completed' : '');
    itemEl.dataset.id = item.id;
    itemEl.dataset.sectionId = sectionId;
    itemEl.draggable = true;

    let metaHtml = '';

    const priorityLabels = { high: 'High', medium: 'Medium', low: 'Low' };
    metaHtml += `<span class="item-priority-badge ${item.priority}">${priorityLabels[item.priority] || 'Medium'}</span>`;

    if (item.dueDate) {
        const dateClass = DateUtils.isOverdue(item.dueDate) ? 'overdue' :
            DateUtils.isToday(item.dueDate) ? 'today' : '';
        metaHtml += `<span class="item-due-date ${dateClass}">${Icons.calendar} ${DateUtils.formatDate(item.dueDate)}</span>`;
    }

    if (item.tags && item.tags.length > 0) {
        item.tags.forEach(tag => {
            metaHtml += `<span class="item-tag">#${escapeHtml(tag)}</span>`;
        });
    }

    if (item.notes) {
        metaHtml += `<span class="item-note-indicator">${Icons.note} Note</span>`;
    }

    if (item.recurring) {
        metaHtml += `<span class="item-due-date">${Icons.repeat} ${item.recurring}</span>`;
    }

    itemEl.innerHTML = `
        <div class="item-drag-handle" title="Drag to reorder">
            ${Icons.grip}
        </div>
        <label class="item-checkbox">
            <input type="checkbox" ${item.completed ? 'checked' : ''}>
            <span class="item-checkbox-visual">${Icons.check}</span>
        </label>
        <div class="item-content">
            <div class="item-line">
                <p class="item-text">${escapeHtml(item.text)}</p>
                <span class="item-leader"></span>
                ${metaHtml ? `<div class="item-meta">${metaHtml}</div>` : ''}
            </div>
            ${item.description ? `<p class="item-description">${escapeHtml(item.description)}</p>` : ''}
        </div>
        <div class="item-actions">
            <button class="item-action-btn" data-action="edit" title="Edit (E)">
                ${Icons.edit}
            </button>
            <button class="item-action-btn delete" data-action="delete" title="Delete">
                ${Icons.trash}
            </button>
        </div>
    `;

    return itemEl;
}

// ---- Section navigation item ----
function renderSectionNavItem(section, depth = 0, activeId = null) {
    const progress = DataManager.getSectionProgress(section.id);
    const isActive = section.id === activeId;

    const navItem = document.createElement('div');
    navItem.className = 'section-nav-item' + (isActive ? ' active' : '');
    navItem.dataset.id = section.id;
    navItem.dataset.depth = depth;

    navItem.innerHTML = `
        <span class="section-color" style="background: ${section.color}"></span>
        <span class="section-name">${escapeHtml(section.name)}</span>
        <span class="section-count">${progress.completed}/${progress.total}</span>
    `;

    const fragment = document.createDocumentFragment();
    fragment.appendChild(navItem);

    if (!section.collapsed) {
        section.children.forEach(child => {
            const childFragment = renderSectionNavItem(child, depth + 1, activeId);
            fragment.appendChild(childFragment);
        });
    }

    return fragment;
}

// ---- Statistics panel ----
function renderStatistics() {
    const stats = DataManager.getStatistics();
    const content = document.getElementById('statsPanelContent');

    const maxDaily = Math.max(...stats.weeklyData.map(d => d.count), 1);

    content.innerHTML = `
        <div class="stats-card">
            <div class="stats-card-title">Done</div>
            <div class="stats-value">${stats.percentage}%</div>
            <div class="stats-label">${stats.completed} of ${stats.total} items</div>
        </div>

        <div class="stats-card">
            <div class="stats-card-title">Streak</div>
            <div class="stats-value">${stats.currentStreak} <small>${stats.currentStreak === 1 ? "day" : "days"} in a row</small></div>
            <div class="stats-label">Longest: ${stats.longestStreak} ${stats.longestStreak === 1 ? "day" : "days"}</div>
        </div>

        <div class="stats-card">
            <div class="stats-card-title">This week</div>
            <div class="stats-bar-chart">
                ${stats.weeklyData.map(d => `
                    <div class="stats-bar" style="height: ${(d.count / maxDaily) * 100}%" title="${d.day}: ${d.count} completed"></div>
                `).join('')}
            </div>
            <div class="stats-days">
                ${stats.weeklyData.map(d => `<span>${d.day}</span>`).join('')}
            </div>
        </div>

        <div class="stats-card">
            <div class="stats-card-title">All time</div>
            <div class="stats-pair">
                <div>
                    <div class="stats-value">${stats.totalCreated}</div>
                    <div class="stats-label">created</div>
                </div>
                <div>
                    <div class="stats-value">${stats.totalCompleted}</div>
                    <div class="stats-label">completed</div>
                </div>
            </div>
        </div>
    `;
}

// ---- Command palette ----
function renderCommandPaletteResults(query, results) {
    const container = document.getElementById('commandPaletteResults');
    container.innerHTML = '';

    if (results.length === 0) {
        container.innerHTML = `
            <div class="command-palette-empty">No results</div>
        `;
        return;
    }

    const groups = {};
    results.forEach(result => {
        const type = result.type || 'items';
        if (!groups[type]) groups[type] = [];
        groups[type].push(result);
    });

    Object.entries(groups).forEach(([type, items]) => {
        const group = document.createElement('div');
        group.className = 'command-palette-group';

        group.innerHTML = `<div class="command-palette-group-title">${type}</div>`;

        items.forEach((item, index) => {
            const resultEl = document.createElement('div');
            resultEl.className = 'command-palette-result';
            resultEl.dataset.index = index;
            resultEl.dataset.action = item.action || '';
            resultEl.dataset.id = item.id || '';

            resultEl.innerHTML = `
                ${item.icon ? Icons[item.icon] || '' : ''}
                <div class="command-palette-result-content">
                    <div class="command-palette-result-title">${highlightMatch(item.title, query)}</div>
                    ${item.description ? `<div class="command-palette-result-description">${item.description}</div>` : ''}
                </div>
                ${item.shortcut ? `<kbd>${item.shortcut}</kbd>` : ''}
            `;

            group.appendChild(resultEl);
        });

        container.appendChild(group);
    });
}

// ---- Date picker ----
const DatePicker = {
    overlay: null,
    picker: null,
    currentDate: null,
    selectedDate: null,
    onSelect: null,

    init() {
        this.overlay = document.getElementById('datePickerOverlay');
        this.picker = document.getElementById('datePicker');

        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.hide();
        });
    },

    show(x, y, selectedDate, onSelect) {
        this.selectedDate = selectedDate ? new Date(selectedDate) : null;
        this.currentDate = this.selectedDate ? new Date(this.selectedDate) : new Date();
        this.currentDate.setDate(1);
        this.onSelect = onSelect;

        this.render();

        this.picker.style.left = `${Math.min(x, window.innerWidth - 320)}px`;
        this.picker.style.top = `${Math.min(y, window.innerHeight - 400)}px`;

        this.overlay.classList.add('visible');
    },

    hide() {
        this.overlay.classList.remove('visible');
        this.onSelect = null;
    },

    render() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        let daysHtml = '';

        ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach(day => {
            daysHtml += `<div class="date-picker-day-header">${day}</div>`;
        });

        // tail of the previous month
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            daysHtml += `<div class="date-picker-day other-month" data-date="${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}">${day}</div>`;
        }

        // this month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            let classes = 'date-picker-day';
            if (date.getTime() === today.getTime()) classes += ' today';
            if (this.selectedDate && date.getTime() === this.selectedDate.getTime()) classes += ' selected';

            daysHtml += `<div class="${classes}" data-date="${dateStr}">${day}</div>`;
        }

        // start of the next month
        const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
        const remainingDays = totalCells - (firstDay + daysInMonth);
        for (let day = 1; day <= remainingDays; day++) {
            daysHtml += `<div class="date-picker-day other-month" data-date="${year}-${String(month + 2).padStart(2, '0')}-${String(day).padStart(2, '0')}">${day}</div>`;
        }

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];

        this.picker.innerHTML = `
            <div class="date-picker-header">
                <span class="date-picker-title">${monthNames[month]} ${year}</span>
                <div class="date-picker-nav">
                    <button data-action="prev-month">${Icons.chevronLeft}</button>
                    <button data-action="next-month">${Icons.chevronRight}</button>
                </div>
            </div>
            <div class="date-picker-grid">
                ${daysHtml}
            </div>
            <div class="date-picker-shortcuts">
                <button class="date-picker-shortcut" data-shortcut="today">Today</button>
                <button class="date-picker-shortcut" data-shortcut="tomorrow">Tomorrow</button>
                <button class="date-picker-shortcut" data-shortcut="next-week">Next Week</button>
                <button class="date-picker-shortcut" data-shortcut="clear">Clear</button>
            </div>
        `;

        this.picker.querySelectorAll('.date-picker-day:not(.other-month)').forEach(el => {
            el.addEventListener('click', () => {
                if (this.onSelect) {
                    this.onSelect(el.dataset.date);
                }
                this.hide();
            });
        });

        this.picker.querySelector('[data-action="prev-month"]').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.render();
        });

        this.picker.querySelector('[data-action="next-month"]').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.render();
        });

        this.picker.querySelectorAll('.date-picker-shortcut').forEach(el => {
            el.addEventListener('click', () => {
                const shortcut = el.dataset.shortcut;
                let date = null;

                if (shortcut === 'today') {
                    date = DateUtils.today();
                } else if (shortcut === 'tomorrow') {
                    const d = new Date();
                    d.setDate(d.getDate() + 1);
                    date = d.toISOString().split('T')[0];
                } else if (shortcut === 'next-week') {
                    const d = new Date();
                    d.setDate(d.getDate() + 7);
                    date = d.toISOString().split('T')[0];
                }

                if (this.onSelect) {
                    this.onSelect(date);
                }
                this.hide();
            });
        });
    }
};

// ---- Color picker ----
function renderColorPicker(selectedColor, onSelect) {
    const container = document.createElement('div');
    container.className = 'color-picker';

    SECTION_COLORS.forEach(color => {
        const option = document.createElement('div');
        option.className = 'color-option' + (color === selectedColor ? ' selected' : '');
        option.style.background = color;
        option.dataset.color = color;

        option.addEventListener('click', () => {
            container.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
            option.classList.add('selected');
            if (onSelect) onSelect(color);
        });

        container.appendChild(option);
    });

    return container;
}

// ---- Utility functions ----
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return escapeHtml(text).replace(regex, '<strong>$1</strong>');
}

document.addEventListener('DOMContentLoaded', () => {
    Toast.init();
    Modal.init();
    ContextMenu.init();
    DatePicker.init();
});
