// components/story-dashboard.js
import { LitElement, html, css } from 'lit';
import {
    fetchAllStories,
    fetchDashboardStats,
    fetchStoryStatus,
    getStoryById,
    deleteStory,
    duplicateStory,
    getCurrentStep,
} from '../db/StoryAppDB.js';

const TOTAL_STEPS = 5;

class StoryDashboard extends LitElement {
    static properties = {
        stories:         { type: Array,  state: true },
        filteredStories: { type: Array,  state: true },
        stats:           { type: Object, state: true },
        searchTerm:      { type: String, state: true },
        statusFilter:    { type: String, state: true },
        sortBy:          { type: String, state: true },
        isLoading:       { type: Boolean,state: true },
    };

    constructor() {
        super();
        this.stories = [];
        this.filteredStories = [];
        this.stats = { total: 0, completed: 0, inProgress: 0 };
        this.searchTerm = '';
        this.statusFilter = 'all';
        this.sortBy = 'newest';
        this.isLoading = true;
    }

    createRenderRoot() {
        // Light DOM (as in your original)
        return this;
    }

    async connectedCallback() {
        super.connectedCallback();
        await this.loadData();
    }

    computeProgressFromStep(step) {
        const clamped = Math.max(0, Math.min(TOTAL_STEPS, Number(step || 0)));
        return Math.round((clamped / TOTAL_STEPS) * 100);
    }

    async loadData() {
        this.isLoading = true;
        try {
            const [stats, allStories] = await Promise.all([
                fetchDashboardStats(),
                fetchAllStories(),
            ]);

            // Enrich stories with currentStep/progress/isDone
            const enriched = await Promise.all(
                allStories.map(async (story) => {
                    const currentStep = await getCurrentStep(story.id);
                    const progress = this.computeProgressFromStep(currentStep);
                    const isDone = currentStep >= TOTAL_STEPS;
                    return { ...story, currentStep, progress, isDone };
                })
            );

            this.stats = stats;
            this.stories = enriched;
            await this.updateFilteredStories();
        } catch (err) {
            console.error('Error loading dashboard data:', err);
        } finally {
            this.isLoading = false;
        }
    }

    async updateFilteredStories() {
        let filtered = [...this.stories];

        // Search
        if (this.searchTerm) {
            const q = this.searchTerm.toLowerCase();
            filtered = filtered.filter((s) =>
                (s.title || '').toLowerCase().includes(q) ||
                (s.content || '').toLowerCase().includes(q)
            );
        }

        // Status filter
        if (this.statusFilter !== 'all') {
            filtered = filtered.filter((s) =>
                this.statusFilter === 'completed' ? s.isDone : !s.isDone
            );
        }

        // Sorting
        switch (this.sortBy) {
            case 'oldest':
                filtered.sort((a, b) => a.id - b.id);
                break;
            case 'title':
                filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
                break;
            case 'progress':
                filtered.sort((a, b) => b.progress - a.progress);
                break;
            default: // newest
                filtered.sort((a, b) => b.id - a.id);
        }

        this.filteredStories = filtered;
    }

    handleCreateNew() {
        window.location.href = 'wizard.html';
    }

    async handleSearch(e) {
        this.searchTerm = e.target.value;
        await this.updateFilteredStories();
    }

    async handleStatusFilter(e) {
        this.statusFilter = e.target.value;
        await this.updateFilteredStories();
    }

    async handleSort(e) {
        this.sortBy = e.target.value;
        await this.updateFilteredStories();
    }

    async handleEdit(storyId) {
        try {
            // Use the local enriched story if present; fallback to DB
            const local = this.stories.find((s) => s.id === storyId);
            const [story, currentStep] = await Promise.all([
                getStoryById(storyId),
                local?.currentStep ?? getCurrentStep(storyId),
            ]);

            if (!story) {
                alert('Story not found. It may have been deleted.');
                await this.loadData();
                return;
            }

            const params = new URLSearchParams();
            params.set('storyId', String(storyId));
            if ((currentStep || 0) > 0) params.set('step', String(currentStep));

            window.location.href = `wizard.html?${params.toString()}`;
        } catch (error) {
            console.error('Error loading story for edit:', error);
            alert('Error loading story. Please try again.');
        }
    }

    async handleDelete(storyId) {
        if (!confirm('Delete this story?')) return;
        try {
            await deleteStory(storyId);
            await this.loadData();
        } catch (error) {
            console.error('Error deleting story:', error);
            alert('Error deleting story. Please try again.');
        }
    }

    async handleDuplicate(storyId) {
        try {
            const story = await getStoryById(storyId);
            await duplicateStory(story);
            await this.loadData();
        } catch (error) {
            console.error('Error duplicating story:', error);
            alert('Error duplicating story. Please try again.');
        }
    }

    render() {
        if (this.isLoading) {
            return html`<div class="loading">Loading dashboard...</div>`;
        }
        return html`
      ${this.renderHeader()}
      <div class="dashboard-root-body">
        ${this.renderStats()}
        ${this.renderFilters()}
        ${this.renderStories()}
      </div>
    `;
    }

    renderHeader() {
        return html`
      <section class="dashboard-root-header" aria-label="Dashboard header">
        <h1 class="dashboard-title">Teachers Story Tool</h1>
        <p class="dashboard-subtitle">
          Create and manage educational stories for your students
        </p>
        <button
          class="dashboard-create-btn"
          @click=${this.handleCreateNew}
          title="Start a new story creation wizard"
        >
          Create New Story
        </button>
      </section>
    `;
    }

    renderStats() {
        return html`
      <section class="dashboard-root-stats" aria-label="Dashboard statistics">
        ${['total', 'completed', 'inProgress'].map(
            (key) => html`
            <div
              class="dashboard-stat-card"
              title="${{
                total: 'Total stories created',
                completed: 'Stories you have completed',
                inProgress: 'Stories currently in progress',
            }[key]}"
            >
              <div class="dashboard-stat-number">${this.stats[key]}</div>
              <div class="dashboard-stat-label">
                ${{
                total: 'Total Stories',
                completed: 'Completed',
                inProgress: 'In Progress',
            }[key]}
              </div>
            </div>
          `
        )}
      </section>
    `;
    }

    renderFilters() {
        return html`
      <section class="dashboard-root-filters" aria-label="Filter and sort stories">
        <div class="dashboard-filter-group">
          <input
            type="text"
            class="dashboard-filter-search"
            placeholder="Search stories"
            .value=${this.searchTerm}
            @input=${this.handleSearch}
            title="Search by story title or content"
          />
          <select
            class="dashboard-filter-status"
            .value=${this.statusFilter}
            @change=${this.handleStatusFilter}
            title="Filter stories by status"
          >
            <option value="all" title="Show all stories">All Stories</option>
            <option value="completed" title="Show only completed stories">
              Completed
            </option>
            <option value="inprogress" title="Show only in-progress stories">
              In Progress
            </option>
          </select>
          <select
            class="dashboard-filter-sort"
            .value=${this.sortBy}
            @change=${this.handleSort}
            title="Sort stories"
          >
            <option value="newest" title="Newest first">Newest First</option>
            <option value="oldest" title="Oldest first">Oldest First</option>
            <option value="title" title="Alphabetical by title">Title A-Z</option>
            <option value="progress" title="By completion percentage">
              Progress
            </option>
          </select>
        </div>
      </section>
    `;
    }

    renderStories() {
        if (this.filteredStories.length === 0) {
            return html` <div class="no-stories">No stories found matching your criteria.</div> `;
        }

        return html`
      <section class="dashboard-grid">
        ${this.filteredStories.map((story) => this.renderStoryCard(story))}
      </section>
    `;
    }

    renderStoryCard(story) {
        const statusLabel = story.isDone ? 'Completed' : 'In Progress';
        const statusClass = story.isDone ? 'status-completed' : 'status-inprogress';
        const progressPct = story.progress ?? 0;

        return html`
      <div
        class="dashboard-root-story-card"
        data-story-id="${story.id}"
        title="Story titled '${story.title || 'Untitled'}'"
      >
        <h3 class="story-card-title">${story.title || 'Untitled Story'}</h3>

        <span class="story-card-status ${statusClass}" title="Current status">
          ${statusLabel}
        </span>

        <div class="story-card-progress" title="Completion progress">
          <div class="story-card-progress-bar">
            <div
              class="story-card-progress-fill"
              style="width: ${progressPct}%;"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow="${progressPct}"
              role="progressbar"
            ></div>
          </div>
          <div class="story-card-progress-text">${progressPct}%</div>
          <div class="story-card-step-text">
            Step ${Math.min(story.currentStep || 0, TOTAL_STEPS)} of ${TOTAL_STEPS}
          </div>
        </div>

        <div class="story-card-actions" aria-label="Story actions">
          <button
            class="story-card-btn-edit"
            @click=${() => this.handleEdit(story.id)}
            title="Edit or view this story"
          >
            ${story.isDone ? 'View' : 'Edit'}
          </button>
          <button
            class="story-card-btn-duplicate"
            @click=${() => this.handleDuplicate(story.id)}
            title="Make a copy of this story"
          >
            Duplicate
          </button>
          <button
            class="story-card-btn-delete"
            @click=${() => this.handleDelete(story.id)}
            title="Delete this story"
          >
            Delete
          </button>
        </div>
      </div>
    `;
    }
}

customElements.define('story-dashboard', StoryDashboard);
