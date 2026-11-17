// Specter's Checklist: drag and drop, shortcuts, search, command palette, quick-add parsing

// ---- Drag and drop ----
const DragDropManager = {
    draggedElement: null,
    draggedType: null, // 'item' or 'section'
    draggedId: null,
    dropTarget: null,
    placeholder: null,

    init() {
        this.createPlaceholder();
        this.bindEvents();
    },

    createPlaceholder() {
        this.placeholder = document.createElement('div');
        this.placeholder.className = 'drag-placeholder';
    },

    bindEvents() {
        document.addEventListener('dragstart', (e) => this.onDragStart(e));
        document.addEventListener('dragend', (e) => this.onDragEnd(e));
        document.addEventListener('dragover', (e) => this.onDragOver(e));
        document.addEventListener('drop', (e) => this.onDrop(e));
    },

    onDragStart(e) {
        const item = e.target.closest('.checklist-item');
        const section = e.target.closest('.section-header');

        if (item && e.target.closest('.item-drag-handle')) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', item.dataset.id);

            this.draggedElement = item;
            this.draggedType = 'item';
            this.draggedId = item.dataset.id;

            setTimeout(() => item.classList.add('dragging'), 0);
        } else if (section) {
            // sections are not draggable yet
            e.preventDefault();
        } else {
            e.preventDefault();
        }
    },

    onDragEnd(e) {
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
        }

        document.querySelectorAll('.drag-over').forEach(el => {
            el.classList.remove('drag-over');
        });

        if (this.placeholder.parentNode) {
            this.placeholder.remove();
        }

        this.draggedElement = null;
        this.draggedType = null;
        this.draggedId = null;
        this.dropTarget = null;
    },

    onDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (!this.draggedElement) return;

        const item = e.target.closest('.checklist-item');
        const sectionItems = e.target.closest('.section-items');
        const addBtn = e.target.closest('.add-item-btn');

        document.querySelectorAll('.drag-over').forEach(el => {
            el.classList.remove('drag-over');
        });

        if (item && item !== this.draggedElement) {
            item.classList.add('drag-over');

            const rect = item.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;

            if (e.clientY < midY) {
                item.parentNode.insertBefore(this.placeholder, item);
            } else {
                item.parentNode.insertBefore(this.placeholder, item.nextSibling);
            }

            this.placeholder.style.opacity = '1';
            this.dropTarget = { type: 'before-item', item };
        } else if (sectionItems && sectionItems.children.length === 0) {
            // empty section: drop at the end
            sectionItems.appendChild(this.placeholder);
            this.placeholder.style.opacity = '1';
            this.dropTarget = { type: 'section', sectionId: sectionItems.dataset.sectionId };
        } else if (addBtn) {
            addBtn.classList.add('drag-over');
            this.dropTarget = { type: 'section', sectionId: addBtn.dataset.sectionId };
        }
    },

    onDrop(e) {
        e.preventDefault();

        if (!this.draggedId || !this.dropTarget) return;

        const itemFound = DataManager.findItem(this.draggedId);
        if (!itemFound) return;

        let newSectionId, newIndex;

        if (this.dropTarget.type === 'before-item') {
            const targetItem = this.dropTarget.item;
            newSectionId = targetItem.dataset.sectionId;

            const section = DataManager.findSection(newSectionId);
            newIndex = section.items.findIndex(i => i.id === targetItem.dataset.id);

            // moving down inside the same section shifts the index by one
            if (itemFound.section.id === newSectionId) {
                const currentIndex = itemFound.section.items.findIndex(i => i.id === this.draggedId);
                if (currentIndex < newIndex) newIndex--;
            }
        } else if (this.dropTarget.type === 'section') {
            newSectionId = this.dropTarget.sectionId;
            const section = DataManager.findSection(newSectionId);
            newIndex = section.items.length;
        }

        if (newSectionId !== undefined && newIndex !== undefined) {
            HistoryManager.record('moveItem', {
                itemId: this.draggedId,
                fromSection: itemFound.section.id,
                toSection: newSectionId,
                newIndex
            });

            DataManager.moveItem(this.draggedId, newSectionId, newIndex);
            App.render();
            Toast.success('Item moved');
        }
    }
};

// ---- Keyboard shortcuts ----
const KeyboardManager = {
    shortcuts: {},
    selectedItemId: null,
    enabled: true,

    init() {
        this.registerDefaults();
        this.bindEvents();
    },

    registerDefaults() {
        // navigation
        this.register('ArrowUp', () => this.navigateItems(-1));
        this.register('ArrowDown', () => this.navigateItems(1));
        this.register('ArrowLeft', () => this.collapseSection());
        this.register('ArrowRight', () => this.expandSection());

        // actions
        this.register('n', () => App.quickAddFocus(), { noInput: true });
        this.register('s', () => App.createSection(), { noInput: true });
        this.register('Enter', () => this.toggleSelected(), { noInput: true });
        this.register('e', () => this.editSelected(), { noInput: true });
        this.register('Delete', () => this.deleteSelected(), { noInput: true });
        this.register('Backspace', () => this.deleteSelected(), { noInput: true });
        this.register('d', () => App.toggleTheme(), { noInput: true });

        // with modifiers
        this.register('z', () => App.undo(), { ctrl: true });
        this.register('y', () => App.redo(), { ctrl: true });
        this.register('f', () => App.openSearch(), { ctrl: true });
        this.register('k', () => App.openCommandPalette(), { ctrl: true });

        this.register('Escape', () => {
            this.clearSelection();
            App.closeAllOverlays();
        });

        this.register('/', () => App.openCommandPalette(), { noInput: true });
    },

    register(key, action, options = {}) {
        const normalizedKey = key.toLowerCase();
        if (!this.shortcuts[normalizedKey]) {
            this.shortcuts[normalizedKey] = [];
        }
        this.shortcuts[normalizedKey].push({ action, options });
    },

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (!this.enabled) return;

            const key = e.key.toLowerCase();
            const handlers = this.shortcuts[key];

            if (!handlers) return;

            const isInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
            const isEditable = document.activeElement.isContentEditable;

            for (const handler of handlers) {
                const { action, options } = handler;

                if (options.ctrl && !e.ctrlKey && !e.metaKey) continue;
                if (options.shift && !e.shiftKey) continue;
                if (options.alt && !e.altKey) continue;

                if (options.noInput && (isInput || isEditable)) continue;

                if (options.onlyInput && !(isInput || isEditable)) continue;

                action(e);
                break;
            }
        });
    },

    navigateItems(direction) {
        const items = Array.from(document.querySelectorAll('.checklist-item'));
        if (items.length === 0) return;

        const currentIndex = items.findIndex(i => i.dataset.id === this.selectedItemId);
        let newIndex;

        if (currentIndex === -1) {
            newIndex = direction > 0 ? 0 : items.length - 1;
        } else {
            newIndex = currentIndex + direction;
            if (newIndex < 0) newIndex = items.length - 1;
            if (newIndex >= items.length) newIndex = 0;
        }

        this.selectItem(items[newIndex].dataset.id);
    },

    selectItem(id) {
        document.querySelectorAll('.checklist-item.selected').forEach(el => {
            el.classList.remove('selected');
        });

        this.selectedItemId = id;
        const item = document.querySelector(`.checklist-item[data-id="${id}"]`);
        if (item) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    },

    clearSelection() {
        this.selectedItemId = null;
        document.querySelectorAll('.checklist-item.selected').forEach(el => {
            el.classList.remove('selected');
        });
    },

    toggleSelected() {
        if (this.selectedItemId) {
            DataManager.toggleItem(this.selectedItemId);
            App.render();
        }
    },

    editSelected() {
        if (this.selectedItemId) {
            App.editItem(this.selectedItemId);
        }
    },

    deleteSelected() {
        if (this.selectedItemId) {
            App.deleteItem(this.selectedItemId);
        }
    },

    collapseSection() {
        if (this.selectedItemId) {
            const found = DataManager.findItem(this.selectedItemId);
            if (found) {
                DataManager.updateSection(found.section.id, { collapsed: true });
                App.render();
            }
        }
    },

    expandSection() {
        if (this.selectedItemId) {
            const found = DataManager.findItem(this.selectedItemId);
            if (found) {
                DataManager.updateSection(found.section.id, { collapsed: false });
                App.render();
            }
        }
    }
};

// ---- Search and filter ----
const SearchManager = {
    query: '',
    filters: {},
    results: [],
    isOpen: false,

    init() {
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.query = e.target.value;
                this.search();
            });

            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.clear();
                    searchInput.blur();
                }
            });
        }
    },

    search() {
        if (!this.query && Object.keys(this.filters).length === 0) {
            this.results = [];
            App.render();
            return;
        }

        this.results = DataManager.searchItems(this.query, this.filters);
        App.renderSearchResults(this.results);
    },

    setFilter(key, value) {
        if (value === null || value === undefined) {
            delete this.filters[key];
        } else {
            this.filters[key] = value;
        }
        this.search();
    },

    clear() {
        this.query = '';
        this.filters = {};
        this.results = [];

        const searchInput = document.getElementById('globalSearch');
        if (searchInput) searchInput.value = '';

        App.render();
    }
};

// ---- Command palette ----
const CommandPalette = {
    overlay: null,
    input: null,
    results: null,
    selectedIndex: 0,
    commands: [],
    filteredCommands: [],
    isOpen: false,

    init() {
        this.overlay = document.getElementById('commandPaletteOverlay');
        this.input = document.getElementById('commandPaletteInput');
        this.results = document.getElementById('commandPaletteResults');

        this.registerCommands();
        this.bindEvents();
    },

    registerCommands() {
        this.commands = [
            // actions
            { type: 'Actions', title: 'New Item', description: 'Add a new checklist item', icon: 'plus', shortcut: 'N', action: () => App.quickAddFocus() },
            { type: 'Actions', title: 'New Section', description: 'Create a new section', icon: 'folder', shortcut: 'S', action: () => App.createSection() },
            { type: 'Actions', title: 'Toggle Theme', description: 'Switch between dark and light mode', icon: 'settings', shortcut: 'D', action: () => App.toggleTheme() },
            { type: 'Actions', title: 'Open Statistics', description: 'View your progress stats', icon: 'chart', action: () => App.openStats() },
            { type: 'Actions', title: 'Undo', description: 'Undo last action', icon: 'undo', shortcut: 'Ctrl+Z', action: () => App.undo() },
            { type: 'Actions', title: 'Redo', description: 'Redo last undone action', icon: 'redo', shortcut: 'Ctrl+Y', action: () => App.redo() },

            // data
            { type: 'Data', title: 'Export Data', description: 'Download your checklist as JSON', icon: 'download', action: () => App.exportData('json') },
            { type: 'Data', title: 'Export as Markdown', description: 'Download your checklist as Markdown', icon: 'download', action: () => App.exportData('markdown') },
            { type: 'Data', title: 'Import Data', description: 'Import checklist from JSON file', icon: 'upload', action: () => App.importData() },
            { type: 'Data', title: 'Clear All Data', description: 'Delete all checklists and settings', icon: 'trash', action: () => App.clearAllData() },

            // filters
            { type: 'Filters', title: 'Show Completed', description: 'Filter to show only completed items', icon: 'check', action: () => SearchManager.setFilter('completed', true) },
            { type: 'Filters', title: 'Show Incomplete', description: 'Filter to show only incomplete items', icon: 'uncheckAll', action: () => SearchManager.setFilter('completed', false) },
            { type: 'Filters', title: 'Show Overdue', description: 'Filter to show overdue items', icon: 'calendar', action: () => SearchManager.setFilter('dueDate', 'overdue') },
            { type: 'Filters', title: 'Show Due Today', description: 'Filter to show items due today', icon: 'calendar', action: () => SearchManager.setFilter('dueDate', 'today') },
            { type: 'Filters', title: 'Clear Filters', description: 'Remove all active filters', icon: 'close', action: () => SearchManager.clear() },
        ];
    },

    bindEvents() {
        this.input.addEventListener('input', (e) => {
            this.filter(e.target.value);
        });

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigate(1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigate(-1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                this.executeSelected();
            } else if (e.key === 'Escape') {
                this.close();
            }
        });

        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        this.results.addEventListener('click', (e) => {
            const result = e.target.closest('.command-palette-result');
            if (result) {
                const index = parseInt(result.dataset.index);
                this.selectedIndex = index;
                this.executeSelected();
            }
        });
    },

    open() {
        this.isOpen = true;
        this.input.value = '';
        this.selectedIndex = 0;
        this.filter('');
        this.overlay.classList.add('visible');
        this.input.focus();
    },

    close() {
        this.isOpen = false;
        this.overlay.classList.remove('visible');
    },

    filter(query) {
        const lowerQuery = query.toLowerCase();

        if (!query) {
            this.filteredCommands = [...this.commands];
        } else {
            this.filteredCommands = this.commands.filter(cmd =>
                cmd.title.toLowerCase().includes(lowerQuery) ||
                (cmd.description && cmd.description.toLowerCase().includes(lowerQuery))
            );
        }

        if (query.length >= 2) {
            const searchResults = DataManager.searchItems(query);
            searchResults.slice(0, 5).forEach(result => {
                this.filteredCommands.push({
                    type: 'Items',
                    title: result.item.text,
                    description: `in ${result.section.name}`,
                    icon: result.item.completed ? 'check' : 'uncheckAll',
                    action: () => {
                        App.scrollToItem(result.item.id);
                        KeyboardManager.selectItem(result.item.id);
                    }
                });
            });
        }

        this.selectedIndex = 0;
        this.renderResults(query);
    },

    renderResults(query) {
        renderCommandPaletteResults(query, this.filteredCommands);
        this.updateSelection();
    },

    navigate(direction) {
        const results = this.results.querySelectorAll('.command-palette-result');
        if (results.length === 0) return;

        this.selectedIndex += direction;
        if (this.selectedIndex < 0) this.selectedIndex = results.length - 1;
        if (this.selectedIndex >= results.length) this.selectedIndex = 0;

        this.updateSelection();
    },

    updateSelection() {
        const results = this.results.querySelectorAll('.command-palette-result');
        results.forEach((el, index) => {
            el.classList.toggle('selected', index === this.selectedIndex);
        });

        const selected = results[this.selectedIndex];
        if (selected) {
            selected.scrollIntoView({ block: 'nearest' });
        }
    },

    executeSelected() {
        const cmd = this.filteredCommands[this.selectedIndex];
        if (cmd && cmd.action) {
            this.close();
            cmd.action();
        }
    }
};

// ---- Smart input parser ----
const InputParser = {
    parse(input) {
        let text = input;
        const tags = [];
        let priority = 'medium';
        let dueDate = null;

        // #tag
        const tagRegex = /#(\w+)/g;
        let tagMatch;
        while ((tagMatch = tagRegex.exec(input)) !== null) {
            tags.push(tagMatch[1]);
            text = text.replace(tagMatch[0], '');
        }

        // !high, !low
        const priorityRegex = /!(high|low|medium)/i;
        const priorityMatch = input.match(priorityRegex);
        if (priorityMatch) {
            priority = priorityMatch[1].toLowerCase();
            text = text.replace(priorityMatch[0], '');
        }

        // @today, @tomorrow, @2026-01-31
        const dateRegex = /@(\w+|\d{4}-\d{2}-\d{2})/;
        const dateMatch = input.match(dateRegex);
        if (dateMatch) {
            const parsedDate = DateUtils.parseRelativeDate(dateMatch[1]);
            if (parsedDate) {
                dueDate = parsedDate.toISOString().split('T')[0];
            }
            text = text.replace(dateMatch[0], '');
        }

        return {
            text: text.trim(),
            tags,
            priority,
            dueDate
        };
    }
};

// ---- Auto-Save and sync ----
const AutoSave = {
    saveTimer: null,
    lastSave: null,

    init() {
        DataManager.subscribe((event) => {
            this.scheduleSave();
        });

        window.addEventListener('beforeunload', () => {
            this.saveNow();
        });
    },

    scheduleSave() {
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
        }

        this.saveTimer = setTimeout(() => {
            this.saveNow();
        }, 1000);
    },

    saveNow() {
        DataManager.save();
        this.lastSave = new Date();
    }
};

// ---- Recurring tasks ----
const RecurringTasks = {
    init() {
        this.checkAndResetTasks();
    },

    checkAndResetTasks() {
        const today = DateUtils.today();
        const lastCheck = localStorage.getItem('specter_last_recurring_check');

        if (lastCheck === today) return;

        // once a day, reopen repeating items whose period has passed
        const resetItems = [];

        const checkSection = (section) => {
            section.items.forEach(item => {
                if (item.recurring && item.completed) {
                    const completedDate = item.completedAt ? item.completedAt.split('T')[0] : null;
                    const shouldReset = this.shouldResetRecurring(item.recurring, completedDate);

                    if (shouldReset) {
                        resetItems.push(item);
                    }
                }
            });

            section.children.forEach(child => checkSection(child));
        };

        DataManager.data.sections.forEach(section => checkSection(section));

        resetItems.forEach(item => {
            DataManager.updateItem(item.id, {
                completed: false,
                completedAt: null
            });
        });

        if (resetItems.length > 0) {
            Toast.info(`${resetItems.length} recurring task(s) reset`);
        }

        localStorage.setItem('specter_last_recurring_check', today);
    },

    shouldResetRecurring(recurring, completedDate) {
        if (!completedDate) return false;

        const completed = new Date(completedDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffDays = Math.floor((today - completed) / (1000 * 60 * 60 * 24));

        switch (recurring) {
            case 'daily':
                return diffDays >= 1;
            case 'weekly':
                return diffDays >= 7;
            case 'monthly':
                return diffDays >= 30;
            default:
                return false;
        }
    }
};

// ---- Focus mode ----
const FocusMode = {
    isActive: false,
    focusedSectionId: null,

    toggle() {
        this.isActive = !this.isActive;
        document.body.classList.toggle('focus-mode', this.isActive);

        if (!this.isActive) {
            this.focusedSectionId = null;
        }

        App.render();
        Toast.info(this.isActive ? 'Focus mode enabled' : 'Focus mode disabled');
    },

    focusSection(sectionId) {
        this.focusedSectionId = sectionId;
        this.isActive = true;
        document.body.classList.add('focus-mode');
        App.render();
    },

    shouldShowSection(sectionId) {
        if (!this.isActive) return true;
        if (!this.focusedSectionId) return true;
        return sectionId === this.focusedSectionId;
    }
};

// ---- Suggestions ----
const Suggestions = {
    recentItems: [],
    maxRecent: 20,

    init() {
        this.loadRecent();
    },

    loadRecent() {
        try {
            const stored = localStorage.getItem('specter_recent_items');
            this.recentItems = stored ? JSON.parse(stored) : [];
        } catch {
            this.recentItems = [];
        }
    },

    saveRecent() {
        localStorage.setItem('specter_recent_items', JSON.stringify(this.recentItems.slice(0, this.maxRecent)));
    },

    addRecent(text) {
        this.recentItems = this.recentItems.filter(item => item !== text);
        this.recentItems.unshift(text);
        this.saveRecent();
    },

    getSuggestions(query) {
        if (!query || query.length < 2) return [];

        const lowerQuery = query.toLowerCase();
        const matches = [];

        // from recent items
        this.recentItems.forEach(item => {
            if (item.toLowerCase().includes(lowerQuery)) {
                matches.push({ text: item, source: 'recent' });
            }
        });

        // common patterns
        const patterns = [
            'Review and approve',
            'Follow up on',
            'Complete documentation for',
            'Schedule meeting with',
            'Send email to',
            'Research about',
            'Create presentation for',
            'Update status on',
            'Call regarding',
            'Prepare report on'
        ];

        patterns.forEach(pattern => {
            if (pattern.toLowerCase().includes(lowerQuery)) {
                matches.push({ text: pattern, source: 'pattern' });
            }
        });

        return matches.slice(0, 5);
    }
};

// ---- Initialize all features ----
function initializeFeatures() {
    DragDropManager.init();
    KeyboardManager.init();
    SearchManager.init();
    CommandPalette.init();
    AutoSave.init();
    RecurringTasks.init();
    Suggestions.init();
}

document.addEventListener('DOMContentLoaded', initializeFeatures);
