// Specter's Checklist: wires the page together (events, rendering, dialogs)

const App = {
    activeSectionId: null,

    // ---- Initialization ----
    init() {
        this.bindEvents();
        this.applyTheme();
        this.render();
        this.updateProgress();

        if (DataManager.data.sections.length === 0) {
            setTimeout(() => {
                Toast.info('Add a section to start. Press ? for the shortcuts.');
            }, 500);
        }
    },

    // ---- Event bindings ----
    bindEvents() {
        const quickAddInput = document.getElementById('quickAddInput');
        quickAddInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && quickAddInput.value.trim()) {
                this.handleQuickAdd(quickAddInput.value.trim());
                quickAddInput.value = '';
            }
        });

        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        document.getElementById('statsBtn').addEventListener('click', () => this.openStats());
        document.getElementById('statsClose').addEventListener('click', () => this.closeStats());

        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());

        document.getElementById('addSectionBtn').addEventListener('click', () => this.createSection());
        document.getElementById('createFirstSection').addEventListener('click', () => this.createSection());

        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());

        // one listener on the list handles every section and item
        document.getElementById('checklistContainer').addEventListener('click', (e) => this.handleContentClick(e));
        document.getElementById('checklistContainer').addEventListener('dblclick', (e) => this.handleContentDoubleClick(e));

        document.getElementById('sectionNav').addEventListener('click', (e) => this.handleNavClick(e));

        document.getElementById('checklistContainer').addEventListener('contextmenu', (e) => this.handleContextMenu(e));
        document.getElementById('sectionNav').addEventListener('contextmenu', (e) => this.handleNavContextMenu(e));
        document.getElementById('contentArea').addEventListener('contextmenu', (e) => {
            if (e.target.closest('#emptyState') || e.target === document.getElementById('contentArea')) {
                this.handleEmptyContextMenu(e);
            }
        });

        DataManager.subscribe(() => {
            this.updateProgress();
        });
    },

    // ---- Content event ----
    handleContentClick(e) {
        const target = e.target;

        // checkbox
        const checkbox = target.closest('.item-checkbox input');
        if (checkbox) {
            const item = checkbox.closest('.checklist-item');
            this.toggleItem(item.dataset.id);
            return;
        }

        // collapse arrow
        const collapseBtn = target.closest('.section-collapse-btn');
        if (collapseBtn) {
            const header = collapseBtn.closest('.section-header');
            this.toggleSectionCollapse(header.dataset.sectionId);
            return;
        }

        // section buttons
        const sectionAction = target.closest('.section-action-btn');
        if (sectionAction) {
            const header = sectionAction.closest('.section-header');
            const action = sectionAction.dataset.action;

            if (action === 'add-item') {
                this.addItemToSection(header.dataset.sectionId);
            } else if (action === 'add-subsection') {
                this.createSection(header.dataset.sectionId);
            } else if (action === 'edit') {
                this.editSection(header.dataset.sectionId);
            }
            return;
        }

        // item buttons
        const itemAction = target.closest('.item-action-btn');
        if (itemAction) {
            const item = itemAction.closest('.checklist-item');
            const action = itemAction.dataset.action;

            if (action === 'edit') {
                this.editItem(item.dataset.id);
            } else if (action === 'delete') {
                this.deleteItem(item.dataset.id);
            }
            return;
        }

        // add item
        const addItemBtn = target.closest('.add-item-btn');
        if (addItemBtn) {
            this.addItemToSection(addItemBtn.dataset.sectionId);
            return;
        }

        // plain click selects the item
        const item = target.closest('.checklist-item');
        if (item && !target.closest('.item-checkbox') && !target.closest('.item-actions')) {
            KeyboardManager.selectItem(item.dataset.id);
        }
    },

    handleContentDoubleClick(e) {
        const item = e.target.closest('.checklist-item');
        if (item && !e.target.closest('.item-checkbox') && !e.target.closest('.item-actions')) {
            this.editItem(item.dataset.id);
        }

        const sectionTitle = e.target.closest('.section-title');
        if (sectionTitle) {
            const header = sectionTitle.closest('.section-header');
            this.editSection(header.dataset.sectionId);
        }
    },

    handleNavClick(e) {
        const navItem = e.target.closest('.section-nav-item');
        if (navItem) {
            this.scrollToSection(navItem.dataset.id);
            this.activeSectionId = navItem.dataset.id;
            this.renderNav();
        }
    },

    // ---- Context menu ----
    handleContextMenu(e) {
        e.preventDefault();

        const item = e.target.closest('.checklist-item');
        const section = e.target.closest('.section');

        if (item) {
            this.showItemContextMenu(e.clientX, e.clientY, item.dataset.id);
        } else if (section) {
            const header = section.querySelector('.section-header');
            this.showSectionContextMenu(e.clientX, e.clientY, header.dataset.sectionId);
        }
    },

    handleNavContextMenu(e) {
        e.preventDefault();
        const navItem = e.target.closest('.section-nav-item');
        if (navItem) {
            this.showSectionContextMenu(e.clientX, e.clientY, navItem.dataset.id);
        }
    },

    handleEmptyContextMenu(e) {
        e.preventDefault();
        ContextMenu.show(e.clientX, e.clientY, [
            { icon: 'folder', label: 'New Section', shortcut: 'S', action: () => this.createSection() },
            { divider: true },
            { icon: 'upload', label: 'Import Data', action: () => this.importData() },
            { icon: 'refresh', label: 'Refresh', action: () => this.render() }
        ]);
    },

    showItemContextMenu(x, y, itemId) {
        const found = DataManager.findItem(itemId);
        if (!found) return;

        const { item, section } = found;

        ContextMenu.show(x, y, [
            { icon: 'edit', label: 'Edit', shortcut: 'E', action: () => this.editItem(itemId) },
            { icon: item.completed ? 'uncheckAll' : 'check', label: item.completed ? 'Mark Incomplete' : 'Mark Complete', shortcut: 'Enter', action: () => this.toggleItem(itemId) },
            { divider: true },
            { icon: 'folder', label: 'Convert to Section', action: () => this.convertToSection(itemId) },
            { icon: 'duplicate', label: 'Duplicate', action: () => this.duplicateItem(itemId) },
            { icon: 'move', label: 'Move to...', action: () => this.showMoveDialog(itemId) },
            { divider: true },
            { icon: 'tag', label: 'Add Tags', action: () => this.editItemTags(itemId) },
            { icon: 'calendar', label: 'Set Due Date', action: (target) => this.showDatePicker(itemId, x, y) },
            { icon: 'flag', label: 'Set Priority', action: () => this.showPriorityPicker(itemId) },
            { icon: 'repeat', label: 'Make Recurring', action: () => this.setRecurring(itemId) },
            { icon: 'note', label: item.notes ? 'Edit Note' : 'Add Note', action: () => this.editItemNote(itemId) },
            { divider: true },
            { icon: 'trash', label: 'Delete', shortcut: 'Del', danger: true, action: () => this.deleteItem(itemId) }
        ], { itemId });
    },

    showSectionContextMenu(x, y, sectionId) {
        const section = DataManager.findSection(sectionId);
        if (!section) return;

        ContextMenu.show(x, y, [
            { icon: 'plus', label: 'Add Item', action: () => this.addItemToSection(sectionId) },
            { icon: 'folderPlus', label: 'Add Subsection', action: () => this.createSection(sectionId) },
            { icon: 'edit', label: 'Edit Section', action: () => this.editSection(sectionId) },
            { divider: true },
            { icon: 'checkAll', label: 'Complete All', action: () => this.completeAllInSection(sectionId, true) },
            { icon: 'uncheckAll', label: 'Uncomplete All', action: () => this.completeAllInSection(sectionId, false) },
            { divider: true },
            { icon: 'palette', label: 'Change Color', action: () => this.changeSectionColor(sectionId) },
            { icon: 'download', label: 'Export Section', action: () => this.exportSection(sectionId) },
            { divider: true },
            { icon: 'trash', label: 'Delete Section', danger: true, action: () => this.deleteSection(sectionId) }
        ], { sectionId });
    },

    // ---- Section operations ----
    async createSection(parentId = null) {
        const name = await Modal.prompt({
            title: 'New Section',
            message: parentId ? 'Create a new subsection:' : 'Create a new section:',
            placeholder: 'Section name...'
        });

        if (!name) return;

        HistoryManager.record('createSection', { parentId });
        const section = DataManager.createSection({ name }, parentId);

        this.render();
        this.scrollToSection(section.id);
        Toast.success(`Section "${name}" created`);
    },

    async editSection(sectionId) {
        const section = DataManager.findSection(sectionId);
        if (!section) return;

        const body = document.createElement('div');

        const nameGroup = document.createElement('div');
        nameGroup.className = 'form-group';
        nameGroup.innerHTML = `
            <label class="form-label">Section Name</label>
            <input type="text" class="form-input" id="editSectionName" value="${escapeHtml(section.name)}">
        `;
        body.appendChild(nameGroup);

        const colorGroup = document.createElement('div');
        colorGroup.className = 'form-group';
        colorGroup.innerHTML = `<label class="form-label">Color</label>`;

        let selectedColor = section.color;
        const colorPicker = renderColorPicker(section.color, (color) => {
            selectedColor = color;
        });
        colorGroup.appendChild(colorPicker);
        body.appendChild(colorGroup);

        const footer = document.createElement('div');
        footer.className = 'modal-actions';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-secondary';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.onclick = () => Modal.close();

        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn btn-primary';
        saveBtn.textContent = 'Save';
        saveBtn.onclick = () => {
            const name = document.getElementById('editSectionName').value.trim();
            if (name) {
                HistoryManager.record('updateSection', { sectionId, oldName: section.name });
                DataManager.updateSection(sectionId, { name, color: selectedColor });
                Modal.close();
                this.render();
                Toast.success('Section updated');
            }
        };

        footer.appendChild(cancelBtn);
        footer.appendChild(saveBtn);

        Modal.open({ title: 'Edit Section', body, footer });
        setTimeout(() => document.getElementById('editSectionName').select(), 100);
    },

    async deleteSection(sectionId) {
        const section = DataManager.findSection(sectionId);
        if (!section) return;

        const confirmed = await Modal.confirm({
            title: 'Delete Section',
            message: `Are you sure you want to delete "${section.name}" and all its contents? This cannot be undone.`,
            confirmText: 'Delete',
            danger: true
        });

        if (confirmed) {
            HistoryManager.record('deleteSection', { section });
            DataManager.deleteSection(sectionId);
            this.render();
            Toast.success('Section deleted', {
                action: () => this.undo(),
                actionText: 'Undo'
            });
        }
    },

    toggleSectionCollapse(sectionId) {
        const section = DataManager.findSection(sectionId);
        if (!section) return;

        const newCollapsed = !section.collapsed;
        DataManager.updateSection(sectionId, { collapsed: newCollapsed });

        // toggle the class in place, no full re-render
        const sectionEl = document.querySelector(`.section[data-id="${sectionId}"]`);
        if (sectionEl) {
            sectionEl.classList.toggle('collapsed', newCollapsed);
        }
    },

    completeAllInSection(sectionId, completed) {
        HistoryManager.record('completeAllInSection', { sectionId, completed });
        DataManager.completeAllInSection(sectionId, completed);
        this.render();
        Toast.success(completed ? 'All items completed' : 'All items uncompleted');
    },

    async changeSectionColor(sectionId) {
        const section = DataManager.findSection(sectionId);
        if (!section) return;

        let selectedColor = section.color;
        const colorPicker = renderColorPicker(section.color, (color) => {
            selectedColor = color;
        });

        const footer = document.createElement('div');
        footer.className = 'modal-actions';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-secondary';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.onclick = () => Modal.close();

        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn btn-primary';
        saveBtn.textContent = 'Save';
        saveBtn.onclick = () => {
            DataManager.updateSection(sectionId, { color: selectedColor });
            Modal.close();
            this.render();
        };

        footer.appendChild(cancelBtn);
        footer.appendChild(saveBtn);

        Modal.open({
            title: 'Change Section Color',
            body: colorPicker,
            footer
        });
    },

    // ---- Item operations ----
    handleQuickAdd(input) {
        // no sections yet: make one first
        if (DataManager.data.sections.length === 0) {
            const section = DataManager.createSection({ name: 'Inbox' });
            this.activeSectionId = section.id;
        }

        // goes to the active section, or the first one
        const sectionId = this.activeSectionId || DataManager.data.sections[0]?.id;
        if (!sectionId) return;

        const parsed = InputParser.parse(input);

        HistoryManager.record('createItem', { sectionId });
        DataManager.createItem(sectionId, parsed);
        Suggestions.addRecent(parsed.text);

        this.render();
        Toast.success('Item added');
    },

    async addItemToSection(sectionId) {
        const text = await Modal.prompt({
            title: 'New Item',
            placeholder: 'What needs to be done?'
        });

        if (!text) return;

        const parsed = InputParser.parse(text);
        HistoryManager.record('createItem', { sectionId });
        DataManager.createItem(sectionId, parsed);
        Suggestions.addRecent(parsed.text);

        this.render();
        Toast.success('Item added');
    },

    toggleItem(itemId) {
        const found = DataManager.findItem(itemId);
        if (!found) return;

        const wasCompleted = found.item.completed;
        HistoryManager.record('toggleItem', { itemId, wasCompleted });
        DataManager.toggleItem(itemId);

        // update this item in place, no full re-render
        const itemEl = document.querySelector(`.checklist-item[data-id="${itemId}"]`);
        if (itemEl) {
            const isNowCompleted = !wasCompleted;
            itemEl.classList.toggle('completed', isNowCompleted);
            const checkbox = itemEl.querySelector('.item-checkbox input');
            if (checkbox) checkbox.checked = isNowCompleted;

            this.updateSectionProgress(found.section.id);
            this.updateProgress();
        }

        if (!wasCompleted) {
            Toast.success('Item completed');
        }
    },

    async editItem(itemId) {
        const found = DataManager.findItem(itemId);
        if (!found) return;

        const { item } = found;

        const body = document.createElement('div');
        body.innerHTML = `
            <div class="form-group">
                <label class="form-label">Item Text</label>
                <textarea class="form-input form-textarea" id="editItemText">${escapeHtml(item.text)}</textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Description (optional)</label>
                <textarea class="form-input form-textarea" id="editItemDescription" placeholder="Add more details...">${escapeHtml(item.description || '')}</textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Priority</label>
                <select class="form-input" id="editItemPriority">
                    <option value="low" ${item.priority === 'low' ? 'selected' : ''}>Low</option>
                    <option value="medium" ${item.priority === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="high" ${item.priority === 'high' ? 'selected' : ''}>High</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Due Date</label>
                <input type="date" class="form-input" id="editItemDueDate" value="${item.dueDate || ''}">
            </div>
            <div class="form-group">
                <label class="form-label">Tags (comma separated)</label>
                <input type="text" class="form-input" id="editItemTags" value="${item.tags.join(', ')}">
            </div>
            <div class="form-group">
                <label class="form-label">Notes</label>
                <textarea class="form-input form-textarea" id="editItemNotes" placeholder="Add notes...">${escapeHtml(item.notes || '')}</textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Recurring</label>
                <select class="form-input" id="editItemRecurring">
                    <option value="" ${!item.recurring ? 'selected' : ''}>Not recurring</option>
                    <option value="daily" ${item.recurring === 'daily' ? 'selected' : ''}>Daily</option>
                    <option value="weekly" ${item.recurring === 'weekly' ? 'selected' : ''}>Weekly</option>
                    <option value="monthly" ${item.recurring === 'monthly' ? 'selected' : ''}>Monthly</option>
                </select>
            </div>
        `;

        const footer = document.createElement('div');
        footer.className = 'modal-actions';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-secondary';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.onclick = () => Modal.close();

        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn btn-primary';
        saveBtn.textContent = 'Save';
        saveBtn.onclick = () => {
            const text = document.getElementById('editItemText').value.trim();
            if (!text) return;

            const updates = {
                text,
                description: document.getElementById('editItemDescription').value.trim(),
                priority: document.getElementById('editItemPriority').value,
                dueDate: document.getElementById('editItemDueDate').value || null,
                tags: document.getElementById('editItemTags').value.split(',').map(t => t.trim()).filter(Boolean),
                notes: document.getElementById('editItemNotes').value,
                recurring: document.getElementById('editItemRecurring').value || null
            };

            HistoryManager.record('updateItem', { itemId, oldItem: { ...item } });
            DataManager.updateItem(itemId, updates);
            Modal.close();
            this.render();
            Toast.success('Item updated');
        };

        footer.appendChild(cancelBtn);
        footer.appendChild(saveBtn);

        Modal.open({ title: 'Edit Item', body, footer, width: '520px' });
        setTimeout(() => document.getElementById('editItemText').focus(), 100);
    },

    async deleteItem(itemId) {
        const found = DataManager.findItem(itemId);
        if (!found) return;

        if (DataManager.settings.confirmDelete) {
            const confirmed = await Modal.confirm({
                title: 'Delete Item',
                message: `Delete "${found.item.text}"?`,
                confirmText: 'Delete',
                danger: true
            });

            if (!confirmed) return;
        }

        HistoryManager.record('deleteItem', { item: found.item, sectionId: found.section.id });
        DataManager.deleteItem(itemId);
        KeyboardManager.clearSelection();
        this.render();
        Toast.success('Item deleted', {
            action: () => this.undo(),
            actionText: 'Undo'
        });
    },

    duplicateItem(itemId) {
        HistoryManager.record('duplicateItem', { itemId });
        const newItem = DataManager.duplicateItem(itemId);
        if (newItem) {
            this.render();
            Toast.success('Item duplicated');
        }
    },

    convertToSection(itemId) {
        HistoryManager.record('convertToSection', { itemId });
        const section = DataManager.convertItemToSection(itemId);
        if (section) {
            this.render();
            Toast.success('Converted to section');
        }
    },

    showDatePicker(itemId, x, y) {
        const found = DataManager.findItem(itemId);
        if (!found) return;

        DatePicker.show(x, y, found.item.dueDate, (date) => {
            HistoryManager.record('updateItem', { itemId });
            DataManager.updateItem(itemId, { dueDate: date });
            this.render();
            Toast.success(date ? 'Due date set' : 'Due date cleared');
        });
    },

    async showPriorityPicker(itemId) {
        const found = DataManager.findItem(itemId);
        if (!found) return;

        const body = document.createElement('div');
        body.className = 'choice-row';

        const priorities = [
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' }
        ];

        priorities.forEach(p => {
            const btn = document.createElement('button');
            btn.className = 'btn ' + (found.item.priority === p.value ? 'btn-primary' : 'btn-secondary');
            btn.innerHTML = `<span class="dot priority-${p.value}"></span>${p.label}`;
            btn.onclick = () => {
                HistoryManager.record('updateItem', { itemId });
                DataManager.updateItem(itemId, { priority: p.value });
                Modal.close();
                this.render();
                Toast.success('Priority updated');
            };
            body.appendChild(btn);
        });

        Modal.open({ title: 'Set Priority', body, footer: '' });
    },

    async setRecurring(itemId) {
        const found = DataManager.findItem(itemId);
        if (!found) return;

        const body = document.createElement('div');
        body.className = 'choice-list';

        const options = [
            { value: null, label: 'Not recurring' },
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' }
        ];

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'btn ' + (found.item.recurring === opt.value ? 'btn-primary' : 'btn-secondary');
            btn.textContent = opt.label;
            btn.onclick = () => {
                HistoryManager.record('updateItem', { itemId });
                DataManager.updateItem(itemId, { recurring: opt.value });
                Modal.close();
                this.render();
                Toast.success(opt.value ? 'Recurring task set' : 'Recurring removed');
            };
            body.appendChild(btn);
        });

        Modal.open({ title: 'Set Recurring', body, footer: '' });
    },

    async editItemTags(itemId) {
        const found = DataManager.findItem(itemId);
        if (!found) return;

        const newTags = await Modal.prompt({
            title: 'Edit Tags',
            message: 'Enter tags separated by commas:',
            defaultValue: found.item.tags.join(', ')
        });

        if (newTags !== null) {
            const tags = newTags.split(',').map(t => t.trim()).filter(Boolean);
            HistoryManager.record('updateItem', { itemId });
            DataManager.updateItem(itemId, { tags });
            this.render();
            Toast.success('Tags updated');
        }
    },

    async editItemNote(itemId) {
        const found = DataManager.findItem(itemId);
        if (!found) return;

        const note = await Modal.prompt({
            title: 'Edit Note',
            placeholder: 'Add a note...',
            defaultValue: found.item.notes || '',
            inputType: 'textarea'
        });

        if (note !== null) {
            HistoryManager.record('updateItem', { itemId });
            DataManager.updateItem(itemId, { notes: note });
            this.render();
            Toast.success('Note updated');
        }
    },

    async showMoveDialog(itemId) {
        const found = DataManager.findItem(itemId);
        if (!found) return;

        const body = document.createElement('div');
        body.innerHTML = '<p class="modal-hint">Move to:</p>';

        const list = document.createElement('div');
        list.className = 'choice-list scroll';

        const renderSectionOption = (section, depth = 0) => {
            if (section.id === found.section.id) return; // Skip current section

            const btn = document.createElement('button');
            btn.className = 'btn btn-secondary';
            btn.style.paddingLeft = `${16 + depth * 16}px`;
            btn.innerHTML = `<span class="dot" style="background: ${section.color}"></span>${escapeHtml(section.name)}`;
            btn.onclick = () => {
                HistoryManager.record('moveItem', { itemId, fromSection: found.section.id, toSection: section.id });
                DataManager.moveItem(itemId, section.id, section.items.length);
                Modal.close();
                this.render();
                Toast.success('Item moved');
            };
            list.appendChild(btn);

            section.children.forEach(child => renderSectionOption(child, depth + 1));
        };

        DataManager.data.sections.forEach(section => renderSectionOption(section));
        body.appendChild(list);

        Modal.open({ title: 'Move Item', body, footer: '' });
    },

    // ---- Theme and settings ----
    toggleTheme() {
        const currentTheme = document.documentElement.dataset.theme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = newTheme;
        DataManager.settings.theme = newTheme;
        DataManager.save();
        Toast.info(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode enabled`);
    },

    applyTheme() {
        document.documentElement.dataset.theme = DataManager.settings.theme || 'dark';
    },

    async openSettings() {
        const settings = DataManager.settings;

        const body = document.createElement('div');
        body.innerHTML = `
            <div class="form-group">
                <label class="form-label switch-row">
                    <span>Confirm before deleting</span>
                    <input type="checkbox" id="settingConfirmDelete" ${settings.confirmDelete ? 'checked' : ''}>
                </label>
            </div>
            <div class="form-group">
                <label class="form-label switch-row">
                    <span>Show completed items</span>
                    <input type="checkbox" id="settingShowCompleted" ${settings.showCompleted ? 'checked' : ''}>
                </label>
            </div>
            <div class="form-group">
                <label class="form-label">Default Priority</label>
                <select class="form-input" id="settingDefaultPriority">
                    <option value="low" ${settings.defaultPriority === 'low' ? 'selected' : ''}>Low</option>
                    <option value="medium" ${settings.defaultPriority === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="high" ${settings.defaultPriority === 'high' ? 'selected' : ''}>High</option>
                </select>
            </div>
        `;

        const footer = document.createElement('div');
        footer.className = 'modal-actions';

        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn btn-primary';
        saveBtn.textContent = 'Save';
        saveBtn.onclick = () => {
            DataManager.settings.confirmDelete = document.getElementById('settingConfirmDelete').checked;
            DataManager.settings.showCompleted = document.getElementById('settingShowCompleted').checked;
            DataManager.settings.defaultPriority = document.getElementById('settingDefaultPriority').value;
            DataManager.save();
            Modal.close();
            this.render();
            Toast.success('Settings saved');
        };

        footer.appendChild(saveBtn);

        Modal.open({ title: 'Settings', body, footer });
    },

    // ---- Statistics ----
    openStats() {
        renderStatistics();
        document.getElementById('statsPanel').classList.add('visible');
    },

    closeStats() {
        document.getElementById('statsPanel').classList.remove('visible');
    },

    // ---- Undo / redo ----
    undo() {
        if (HistoryManager.canUndo()) {
            HistoryManager.undo();
            this.render();
            Toast.info('Undone');
        } else {
            Toast.warning('Nothing to undo');
        }
    },

    redo() {
        if (HistoryManager.canRedo()) {
            HistoryManager.redo();
            this.render();
            Toast.info('Redone');
        } else {
            Toast.warning('Nothing to redo');
        }
    },

    // ---- Import / export ----
    exportData(format = 'json') {
        const data = DataManager.exportData(format);
        const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/markdown' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `specter-checklist-${new Date().toISOString().split('T')[0]}.${format === 'json' ? 'json' : 'md'}`;
        a.click();

        URL.revokeObjectURL(url);
        Toast.success('Export complete');
    },

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const success = DataManager.importData(text);

                if (success) {
                    this.render();
                    Toast.success('Import successful');
                } else {
                    Toast.error('Invalid file format');
                }
            } catch (err) {
                Toast.error('Failed to read file');
            }
        };

        input.click();
    },

    exportSection(sectionId) {
        const section = DataManager.findSection(sectionId);
        if (!section) return;

        const data = JSON.stringify({ sections: [section] }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${section.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        URL.revokeObjectURL(url);
        Toast.success('Section exported');
    },

    async clearAllData() {
        const confirmed = await Modal.confirm({
            title: 'Clear All Data',
            message: 'Are you absolutely sure? This will delete ALL your checklists, settings, and statistics. This action cannot be undone.',
            confirmText: 'Delete Everything',
            danger: true
        });

        if (confirmed) {
            DataManager.clearAllData();
            HistoryManager.clear();
            this.render();
            Toast.success('All data cleared');
        }
    },

    // ---- Navigation and scrolling ----
    scrollToSection(sectionId) {
        const section = document.querySelector(`.section[data-id="${sectionId}"]`);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },

    scrollToItem(itemId) {
        const item = document.querySelector(`.checklist-item[data-id="${itemId}"]`);
        if (item) {
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    },

    quickAddFocus() {
        document.getElementById('quickAddInput').focus();
    },

    openSearch() {
        document.getElementById('globalSearch').focus();
    },

    openCommandPalette() {
        CommandPalette.open();
    },

    closeAllOverlays() {
        Modal.close();
        CommandPalette.close();
        ContextMenu.hide();
        DatePicker.hide();
        this.closeStats();
    },

    // ---- Rendering ----
    render() {
        this.renderContent();
        this.renderNav();
        this.updateProgress();
    },

    renderContent() {
        const container = document.getElementById('checklistContainer');
        const emptyState = document.getElementById('emptyState');
        const sections = DataManager.data.sections;

        if (sections.length === 0) {
            container.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        container.classList.remove('hidden');
        emptyState.classList.add('hidden');

        container.innerHTML = '';
        sections.forEach(section => {
            container.appendChild(renderSection(section));
        });
    },

    renderNav() {
        const nav = document.getElementById('sectionNav');
        nav.innerHTML = '';

        DataManager.data.sections.forEach(section => {
            const fragment = renderSectionNavItem(section, 0, this.activeSectionId);
            nav.appendChild(fragment);
        });
    },

    renderSearchResults(results) {
        // search only highlights the matches for now
        document.querySelectorAll('.checklist-item').forEach(el => {
            el.classList.remove('search-match');
        });

        results.forEach(result => {
            const el = document.querySelector(`.checklist-item[data-id="${result.item.id}"]`);
            if (el) el.classList.add('search-match');
        });
    },

    updateSectionProgress(sectionId) {
        const progress = DataManager.getSectionProgress(sectionId);

        const sectionEl = document.querySelector(`.section[data-id="${sectionId}"]`);
        if (sectionEl) {
            const progressFill = sectionEl.querySelector('.section-progress-fill');
            const progressText = sectionEl.querySelector('.section-progress-text');
            if (progressFill) progressFill.style.width = `${progress.percentage}%`;
            if (progressText) progressText.textContent = `${progress.completed}/${progress.total}`;
        }

        const navItem = document.querySelector(`.section-nav-item[data-id="${sectionId}"]`);
        if (navItem) {
            const count = navItem.querySelector('.section-count');
            if (count) count.textContent = `${progress.completed}/${progress.total}`;
        }
    },

    updateProgress() {
        const progress = DataManager.getOverallProgress();

        const ring = document.getElementById('overallProgressRing');
        const dashOffset = 100 - progress.percentage;
        ring.style.strokeDashoffset = dashOffset;

        document.getElementById('overallProgressText').textContent = `${progress.percentage}%`;
        document.getElementById('overallProgressDetail').textContent =
            `${progress.completed} of ${progress.total} completed`;

        document.getElementById('undoBtn').disabled = !HistoryManager.canUndo();
        document.getElementById('redoBtn').disabled = !HistoryManager.canRedo();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
