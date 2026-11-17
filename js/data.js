// Specter's Checklist: storage, dates, sections, items, undo history

const STORAGE_KEYS = {
    DATA: 'specter_checklist_data',
    SETTINGS: 'specter_checklist_settings',
    HISTORY: 'specter_checklist_history',
    STATS: 'specter_checklist_stats'
};

const DEFAULT_DATA = {
    sections: [],
    version: '1.0.0',
    createdAt: null,
    updatedAt: null
};

const DEFAULT_SETTINGS = {
    theme: 'dark',
    accentColor: '#8b5cf6',
    showCompleted: true,
    autoCollapseCompleted: false,
    confirmDelete: true,
    soundEnabled: true,
    focusMode: false,
    defaultPriority: 'medium',
    dateFormat: 'relative'
};

const DEFAULT_STATS = {
    totalCreated: 0,
    totalCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    dailyCompletions: {},
    weeklyCompletions: []
};

const SECTION_COLORS = [
    '#8b5cf6', // Purple
    '#6366f1', // Indigo
    '#3b82f6', // Blue
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#22c55e', // Green
    '#84cc16', // Lime
    '#eab308', // Yellow
    '#f59e0b', // Amber
    '#f97316', // Orange
    '#ef4444', // Red
    '#ec4899', // Pink
    '#a855f7', // Violet
    '#64748b'  // Slate
];

// ---- UUID generator ----
function generateId() {
    return 'xxxx-xxxx-xxxx'.replace(/x/g, () => {
        return Math.floor(Math.random() * 16).toString(16);
    });
}

// ---- Date utilities ----
const DateUtils = {
    // today as YYYY-MM-DD
    today() {
        return new Date().toISOString().split('T')[0];
    },

    parseRelativeDate(str) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lower = str.toLowerCase().trim();

        if (lower === 'today') return today;
        if (lower === 'tomorrow') {
            const d = new Date(today);
            d.setDate(d.getDate() + 1);
            return d;
        }
        if (lower === 'next week') {
            const d = new Date(today);
            d.setDate(d.getDate() + 7);
            return d;
        }
        if (lower === 'next month') {
            const d = new Date(today);
            d.setMonth(d.getMonth() + 1);
            return d;
        }

        const parsed = new Date(str);
        if (!isNaN(parsed)) return parsed;

        return null;
    },

    formatDate(date, format = 'relative') {
        if (!date) return '';

        const d = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        d.setHours(0, 0, 0, 0);

        if (format === 'relative') {
            if (d.getTime() === today.getTime()) return 'Today';
            if (d.getTime() === tomorrow.getTime()) return 'Tomorrow';
            if (d.getTime() === yesterday.getTime()) return 'Yesterday';

            const diff = Math.floor((d - today) / (1000 * 60 * 60 * 24));
            if (diff > 0 && diff <= 7) return `In ${diff} days`;
            if (diff < 0 && diff >= -7) return `${Math.abs(diff)} days ago`;
        }

        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
    },

    isOverdue(date) {
        if (!date) return false;
        const d = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        d.setHours(0, 0, 0, 0);
        return d < today;
    },

    isToday(date) {
        if (!date) return false;
        const d = new Date(date);
        const today = new Date();
        return d.toDateString() === today.toDateString();
    }
};

// ---- Data manager ----
const DataManager = {
    data: null,
    settings: null,
    stats: null,
    listeners: [],

    init() {
        this.load();
        this.migrateIfNeeded();
        this.updateStreak();
        return this;
    },

    load() {
        try {
            const dataStr = localStorage.getItem(STORAGE_KEYS.DATA);
            this.data = dataStr ? JSON.parse(dataStr) : { ...DEFAULT_DATA, createdAt: new Date().toISOString() };

            const settingsStr = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            this.settings = settingsStr ? { ...DEFAULT_SETTINGS, ...JSON.parse(settingsStr) } : { ...DEFAULT_SETTINGS };

            const statsStr = localStorage.getItem(STORAGE_KEYS.STATS);
            this.stats = statsStr ? { ...DEFAULT_STATS, ...JSON.parse(statsStr) } : { ...DEFAULT_STATS };
        } catch (e) {
            console.error('Failed to load data:', e);
            this.data = { ...DEFAULT_DATA, createdAt: new Date().toISOString() };
            this.settings = { ...DEFAULT_SETTINGS };
            this.stats = { ...DEFAULT_STATS };
        }
    },

    save() {
        try {
            this.data.updatedAt = new Date().toISOString();
            localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(this.data));
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
            localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(this.stats));
            this.notifyListeners('save');
        } catch (e) {
            console.error('Failed to save data:', e);
        }
    },

    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    },

    notifyListeners(event, data) {
        this.listeners.forEach(l => l(event, data));
    },

    migrateIfNeeded() {
        // nothing to migrate yet, version 1 is the only format
    },

    updateStreak() {
        const today = DateUtils.today();
        const lastActive = this.stats.lastActiveDate;

        if (!lastActive) {
            this.stats.currentStreak = 0;
        } else if (lastActive === today) {
            // already counted today
        } else {
            const last = new Date(lastActive);
            const now = new Date(today);
            const diff = Math.floor((now - last) / (1000 * 60 * 60 * 24));

            if (diff === 1) {
                // yesterday was active, the streak continues
            } else if (diff > 1) {
                // a day was missed
                this.stats.currentStreak = 0;
            }
        }

        this.save();
    },

    recordCompletion() {
        const today = DateUtils.today();

        this.stats.totalCompleted++;
        this.stats.dailyCompletions[today] = (this.stats.dailyCompletions[today] || 0) + 1;

        if (this.stats.lastActiveDate !== today) {
            const lastActive = this.stats.lastActiveDate;
            if (lastActive) {
                const last = new Date(lastActive);
                const now = new Date(today);
                const diff = Math.floor((now - last) / (1000 * 60 * 60 * 24));

                if (diff === 1) {
                    this.stats.currentStreak++;
                } else {
                    this.stats.currentStreak = 1;
                }
            } else {
                this.stats.currentStreak = 1;
            }

            this.stats.lastActiveDate = today;
        }

        this.stats.longestStreak = Math.max(this.stats.longestStreak, this.stats.currentStreak);
        this.save();
    },

    // ---- Section operations ----

    getSections(parentId = null) {
        if (parentId === null) {
            return this.data.sections;
        }
        const parent = this.findSection(parentId);
        return parent ? parent.children : [];
    },

    findSection(id, sections = this.data.sections) {
        for (const section of sections) {
            if (section.id === id) return section;
            if (section.children && section.children.length > 0) {
                const found = this.findSection(id, section.children);
                if (found) return found;
            }
        }
        return null;
    },

    findSectionParent(id, sections = this.data.sections, parent = null) {
        for (const section of sections) {
            if (section.id === id) return parent;
            if (section.children && section.children.length > 0) {
                const found = this.findSectionParent(id, section.children, section);
                if (found !== undefined) return found;
            }
        }
        return undefined;
    },

    getSectionPath(id) {
        const path = [];
        let current = this.findSection(id);

        while (current) {
            path.unshift(current);
            const parent = this.findSectionParent(current.id);
            current = parent;
        }

        return path;
    },

    createSection(data, parentId = null) {
        const section = {
            id: generateId(),
            name: data.name || 'New Section',
            color: data.color || SECTION_COLORS[Math.floor(Math.random() * SECTION_COLORS.length)],
            collapsed: false,
            createdAt: new Date().toISOString(),
            items: [],
            children: []
        };

        if (parentId) {
            const parent = this.findSection(parentId);
            if (parent) {
                parent.children.push(section);
            }
        } else {
            this.data.sections.push(section);
        }

        this.save();
        this.notifyListeners('sectionCreated', section);
        return section;
    },

    updateSection(id, updates) {
        const section = this.findSection(id);
        if (section) {
            Object.assign(section, updates);
            this.save();
            this.notifyListeners('sectionUpdated', section);
        }
        return section;
    },

    deleteSection(id) {
        const deleteFromList = (list) => {
            const index = list.findIndex(s => s.id === id);
            if (index !== -1) {
                list.splice(index, 1);
                return true;
            }
            for (const section of list) {
                if (section.children && deleteFromList(section.children)) {
                    return true;
                }
            }
            return false;
        };

        deleteFromList(this.data.sections);
        this.save();
        this.notifyListeners('sectionDeleted', { id });
    },

    moveSection(id, newParentId, newIndex) {
        const section = this.findSection(id);
        if (!section) return;

        const currentParent = this.findSectionParent(id);
        const currentList = currentParent ? currentParent.children : this.data.sections;
        const currentIndex = currentList.findIndex(s => s.id === id);
        if (currentIndex !== -1) {
            currentList.splice(currentIndex, 1);
        }

        const newParent = newParentId ? this.findSection(newParentId) : null;
        const newList = newParent ? newParent.children : this.data.sections;
        newList.splice(newIndex, 0, section);

        this.save();
        this.notifyListeners('sectionMoved', { id, newParentId, newIndex });
    },

    getSectionProgress(id) {
        const section = this.findSection(id);
        if (!section) return { completed: 0, total: 0, percentage: 0 };

        let completed = 0;
        let total = 0;

        const countItems = (s) => {
            for (const item of s.items) {
                total++;
                if (item.completed) completed++;
            }
            for (const child of s.children) {
                countItems(child);
            }
        };

        countItems(section);
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { completed, total, percentage };
    },

    completeAllInSection(id, completed = true) {
        const section = this.findSection(id);
        if (!section) return;

        const completeItems = (s) => {
            for (const item of s.items) {
                if (item.completed !== completed) {
                    item.completed = completed;
                    item.completedAt = completed ? new Date().toISOString() : null;
                    if (completed) this.recordCompletion();
                }
            }
            for (const child of s.children) {
                completeItems(child);
            }
        };

        completeItems(section);
        this.save();
        this.notifyListeners('sectionUpdated', section);
    },

    // ---- Item operations ----

    findItem(id, sections = this.data.sections) {
        for (const section of sections) {
            for (const item of section.items) {
                if (item.id === id) return { item, section };
            }
            if (section.children && section.children.length > 0) {
                const found = this.findItem(id, section.children);
                if (found) return found;
            }
        }
        return null;
    },

    createItem(sectionId, data = {}) {
        const section = this.findSection(sectionId);
        if (!section) return null;

        const item = {
            id: generateId(),
            text: data.text || '',
            description: data.description || '',
            completed: false,
            priority: data.priority || 'medium',
            dueDate: data.dueDate || null,
            tags: data.tags || [],
            notes: data.notes || '',
            recurring: data.recurring || null,
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        section.items.push(item);
        this.stats.totalCreated++;
        this.save();
        this.notifyListeners('itemCreated', { item, sectionId });
        return item;
    },

    updateItem(id, updates) {
        const found = this.findItem(id);
        if (found) {
            const wasCompleted = found.item.completed;
            Object.assign(found.item, updates);

            if (!wasCompleted && found.item.completed) {
                found.item.completedAt = new Date().toISOString();
                this.recordCompletion();
            } else if (wasCompleted && !found.item.completed) {
                found.item.completedAt = null;
            }

            this.save();
            this.notifyListeners('itemUpdated', found.item);
        }
        return found?.item;
    },

    toggleItem(id) {
        const found = this.findItem(id);
        if (found) {
            return this.updateItem(id, { completed: !found.item.completed });
        }
        return null;
    },

    deleteItem(id) {
        const found = this.findItem(id);
        if (found) {
            const index = found.section.items.findIndex(i => i.id === id);
            if (index !== -1) {
                found.section.items.splice(index, 1);
                this.save();
                this.notifyListeners('itemDeleted', { id, sectionId: found.section.id });
            }
        }
    },

    moveItem(id, newSectionId, newIndex) {
        const found = this.findItem(id);
        if (!found) return;

        const newSection = this.findSection(newSectionId);
        if (!newSection) return;

        const currentIndex = found.section.items.findIndex(i => i.id === id);
        if (currentIndex !== -1) {
            found.section.items.splice(currentIndex, 1);
        }

        newSection.items.splice(newIndex, 0, found.item);

        this.save();
        this.notifyListeners('itemMoved', { id, newSectionId, newIndex });
    },

    duplicateItem(id) {
        const found = this.findItem(id);
        if (!found) return null;

        const duplicate = {
            ...found.item,
            id: generateId(),
            completed: false,
            completedAt: null,
            createdAt: new Date().toISOString()
        };

        const index = found.section.items.findIndex(i => i.id === id);
        found.section.items.splice(index + 1, 0, duplicate);

        this.stats.totalCreated++;
        this.save();
        this.notifyListeners('itemCreated', { item: duplicate, sectionId: found.section.id });
        return duplicate;
    },

    convertItemToSection(id) {
        const found = this.findItem(id);
        if (!found) return null;

        const newSection = this.createSection({
            name: found.item.text,
            color: found.section.color
        }, found.section.id);

        this.deleteItem(id);
        return newSection;
    },

    // ---- Search and filter ----

    searchItems(query, filters = {}) {
        const results = [];
        const lowerQuery = query.toLowerCase();

        const searchInSection = (section, path = []) => {
            const currentPath = [...path, section];

            for (const item of section.items) {
                let matches = true;

                if (query && !item.text.toLowerCase().includes(lowerQuery)) {
                    matches = false;
                }

                if (filters.completed !== undefined && item.completed !== filters.completed) {
                    matches = false;
                }

                if (filters.priority && item.priority !== filters.priority) {
                    matches = false;
                }

                if (filters.tags && filters.tags.length > 0) {
                    if (!filters.tags.some(t => item.tags.includes(t))) {
                        matches = false;
                    }
                }

                if (filters.dueDate) {
                    if (filters.dueDate === 'overdue' && !DateUtils.isOverdue(item.dueDate)) {
                        matches = false;
                    } else if (filters.dueDate === 'today' && !DateUtils.isToday(item.dueDate)) {
                        matches = false;
                    } else if (filters.dueDate === 'upcoming' && !item.dueDate) {
                        matches = false;
                    }
                }

                if (matches) {
                    results.push({ item, section, path: currentPath });
                }
            }

            for (const child of section.children) {
                searchInSection(child, currentPath);
            }
        };

        for (const section of this.data.sections) {
            searchInSection(section);
        }

        return results;
    },

    getAllTags() {
        const tags = new Set();

        const collectTags = (sections) => {
            for (const section of sections) {
                for (const item of section.items) {
                    for (const tag of item.tags) {
                        tags.add(tag);
                    }
                }
                if (section.children) {
                    collectTags(section.children);
                }
            }
        };

        collectTags(this.data.sections);
        return Array.from(tags).sort();
    },

    // ---- Overall statistics ----

    getOverallProgress() {
        let completed = 0;
        let total = 0;

        const countItems = (sections) => {
            for (const section of sections) {
                for (const item of section.items) {
                    total++;
                    if (item.completed) completed++;
                }
                if (section.children) {
                    countItems(section.children);
                }
            }
        };

        countItems(this.data.sections);
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { completed, total, percentage };
    },

    getStatistics() {
        const progress = this.getOverallProgress();

        const weeklyData = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            weeklyData.push({
                date: dateStr,
                day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                count: this.stats.dailyCompletions[dateStr] || 0
            });
        }

        return {
            ...progress,
            totalCreated: this.stats.totalCreated,
            totalCompleted: this.stats.totalCompleted,
            currentStreak: this.stats.currentStreak,
            longestStreak: this.stats.longestStreak,
            weeklyData
        };
    },

    // ---- Import / export ----

    exportData(format = 'json') {
        if (format === 'json') {
            return JSON.stringify({
                data: this.data,
                settings: this.settings,
                stats: this.stats,
                exportedAt: new Date().toISOString()
            }, null, 2);
        }

        if (format === 'markdown') {
            let md = '# Specter\'s Checklist Export\n\n';
            md += `*Exported on ${new Date().toLocaleString()}*\n\n`;

            const renderSection = (section, depth = 0) => {
                const indent = '  '.repeat(depth);
                md += `${indent}${'#'.repeat(depth + 2)} ${section.name}\n\n`;

                for (const item of section.items) {
                    const checkbox = item.completed ? '[x]' : '[ ]';
                    md += `${indent}- ${checkbox} ${item.text}`;
                    if (item.priority !== 'medium') md += ` !${item.priority}`;
                    if (item.dueDate) md += ` @${item.dueDate}`;
                    if (item.tags.length) md += ` ${item.tags.map(t => '#' + t).join(' ')}`;
                    md += '\n';
                }

                if (section.items.length) md += '\n';

                for (const child of section.children) {
                    renderSection(child, depth + 1);
                }
            };

            for (const section of this.data.sections) {
                renderSection(section);
            }

            return md;
        }

        return null;
    },

    importData(jsonString) {
        try {
            const imported = JSON.parse(jsonString);

            if (imported.data && imported.data.sections) {
                this.data = imported.data;
                if (imported.settings) {
                    this.settings = { ...DEFAULT_SETTINGS, ...imported.settings };
                }
                if (imported.stats) {
                    this.stats = { ...DEFAULT_STATS, ...imported.stats };
                }
                this.save();
                this.notifyListeners('dataImported');
                return true;
            }

            return false;
        } catch (e) {
            console.error('Import failed:', e);
            return false;
        }
    },

    clearAllData() {
        localStorage.removeItem(STORAGE_KEYS.DATA);
        localStorage.removeItem(STORAGE_KEYS.SETTINGS);
        localStorage.removeItem(STORAGE_KEYS.STATS);
        localStorage.removeItem(STORAGE_KEYS.HISTORY);
        this.data = { ...DEFAULT_DATA, createdAt: new Date().toISOString() };
        this.settings = { ...DEFAULT_SETTINGS };
        this.stats = { ...DEFAULT_STATS };
        this.notifyListeners('dataCleared');
    }
};

// ---- Undo/Redo history manager ----
const HistoryManager = {
    history: [],
    currentIndex: -1,
    maxHistory: 50,

    init() {
        this.loadHistory();
        return this;
    },

    loadHistory() {
        try {
            const historyStr = localStorage.getItem(STORAGE_KEYS.HISTORY);
            if (historyStr) {
                const parsed = JSON.parse(historyStr);
                this.history = parsed.history || [];
                this.currentIndex = parsed.currentIndex ?? -1;
            }
        } catch (e) {
            this.history = [];
            this.currentIndex = -1;
        }
    },

    saveHistory() {
        try {
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify({
                history: this.history.slice(-this.maxHistory),
                currentIndex: this.currentIndex
            }));
        } catch (e) {
            console.error('Failed to save history:', e);
        }
    },

    record(action, data) {
        // a new action drops whatever was undone after this point
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }

        this.history.push({
            action,
            data,
            timestamp: Date.now(),
            snapshot: JSON.stringify(DataManager.data)
        });

        this.currentIndex = this.history.length - 1;

        if (this.history.length > this.maxHistory) {
            this.history = this.history.slice(-this.maxHistory);
            this.currentIndex = this.history.length - 1;
        }

        this.saveHistory();
    },

    canUndo() {
        return this.currentIndex > 0;
    },

    canRedo() {
        return this.currentIndex < this.history.length - 1;
    },

    undo() {
        if (!this.canUndo()) return null;

        this.currentIndex--;
        const entry = this.history[this.currentIndex];

        if (entry && entry.snapshot) {
            DataManager.data = JSON.parse(entry.snapshot);
            DataManager.save();
            this.saveHistory();
            return entry;
        }

        return null;
    },

    redo() {
        if (!this.canRedo()) return null;

        this.currentIndex++;
        const entry = this.history[this.currentIndex];

        if (entry && entry.snapshot) {
            DataManager.data = JSON.parse(entry.snapshot);
            DataManager.save();
            this.saveHistory();
            return entry;
        }

        return null;
    },

    clear() {
        this.history = [];
        this.currentIndex = -1;
        localStorage.removeItem(STORAGE_KEYS.HISTORY);
    }
};

DataManager.init();
HistoryManager.init();
