# Design Document: Todo List Life Dashboard

## Overview

The Todo List Life Dashboard is a single-page web application built with vanilla JavaScript, HTML, and CSS. The application runs entirely in the browser with no backend dependencies, using the browser's Local Storage API for data persistence.

### Key Design Principles

1. **Client-Side Only**: All logic executes in the browser; no server communication required
2. **Vanilla JavaScript**: No framework dependencies to minimize complexity and load time
3. **Component-Based Architecture**: Logical separation of concerns despite vanilla implementation
4. **Immediate Persistence**: All user actions automatically save to Local Storage
5. **Responsive UI**: Sub-100ms response time for all user interactions

### Technology Stack

- **HTML5**: Semantic markup for structure
- **CSS3**: Styling with flexbox/grid for layout
- **Vanilla JavaScript (ES6+)**: Application logic
- **Local Storage API**: Client-side data persistence
- **No external dependencies**: Self-contained application

## Architecture

### Application Structure

```
todo-list-life-dashboard/
├── index.html          # Main entry point
├── css/
│   └── styles.css      # All application styles
└── js/
    └── app.js          # All application logic
```

### Component Architecture

The application follows a component-based mental model implemented in vanilla JavaScript:

```
Dashboard (Root)
├── GreetingDisplay
│   ├── TimeDisplay
│   └── GreetingMessage
├── FocusTimer
│   ├── TimerDisplay
│   └── TimerControls
├── TaskList
│   ├── TaskInput
│   └── TaskItem[]
└── QuickLinksPanel
    ├── LinkInput
    └── QuickLink[]
```

Each component is implemented as a JavaScript module pattern or class with:

- State management
- Render logic
- Event handlers
- Local Storage integration

### Data Flow

1. **Initialization**: Load data from Local Storage → Initialize components → Render UI
2. **User Action**: Event triggered → Update component state → Save to Local Storage → Re-render affected UI
3. **Time Updates**: setInterval → Update time display → Check greeting period → Update if changed

## Components and Interfaces

### 1. GreetingDisplay Component

**Responsibilities:**

- Display current time in 12-hour format
- Display current date in human-readable format
- Show time-based greeting message
- Update every second

**State:**

```javascript
{
  currentTime: Date,
  greeting: string  // "Good Morning" | "Good Afternoon" | "Good Evening" | "Good Night"
}
```

**Key Methods:**

- `updateTime()`: Updates current time and greeting
- `formatTime(date)`: Returns "HH:MM:SS AM/PM"
- `formatDate(date)`: Returns "DayOfWeek, Month Day"
- `getGreeting(hour)`: Returns appropriate greeting based on hour
- `render()`: Updates DOM with current time and greeting

**Time Period Logic:**

- Morning: 5:00 AM - 11:59 AM
- Afternoon: 12:00 PM - 4:59 PM
- Evening: 5:00 PM - 8:59 PM
- Night: 9:00 PM - 4:59 AM

### 2. FocusTimer Component

**Responsibilities:**

- Manage 30-minute countdown timer
- Provide start/stop/reset controls
- Display remaining time in MM:SS format
- Auto-stop at 00:00

**State:**

```javascript
{
  totalSeconds: number,      // 1500 ( 25 minutes)
  remainingSeconds: number,  // Current countdown value
  isRunning: boolean,
  intervalId: number | null
}
```

**Key Methods:**

- `start()`: Begin countdown from current remaining time
- `stop()`: Pause countdown
- `reset()`: Set remaining time back to 1500 seconds
- `tick()`: Decrement remaining time by 1 second
- `formatTime(seconds)`: Returns "MM:SS"
- `render()`: Updates DOM with current time and button states

**Timer Logic:**

- Uses `setInterval` with 1000ms interval when running
- Clears interval when stopped or reaches 00:00
- Does not persist state to Local Storage (resets on page reload)

### 3. TaskList Component

**Responsibilities:**

- Manage collection of tasks
- Handle task CRUD operations
- Persist tasks to Local Storage
- Validate task input

**State:**

```javascript
{
  tasks: Task[],
  editingTaskId: string | null
}
```

**Task Data Model:**

```javascript
{
  id: string,           // Unique identifier (timestamp or UUID)
  text: string,         // Task description
  completed: boolean,   // Completion status
  createdAt: number     // Timestamp
}
```

**Key Methods:**

- `addTask(text)`: Create new task if text is valid
- `updateTask(id, updates)`: Modify existing task
- `deleteTask(id)`: Remove task from list
- `toggleComplete(id)`: Toggle task completion status
- `validateTaskText(text)`: Returns true if text is non-empty and not just whitespace
- `loadFromStorage()`: Retrieve tasks from Local Storage
- `saveToStorage()`: Persist current tasks to Local Storage
- `render()`: Update DOM with current task list

**Local Storage Key:** `"dashboard_tasks"`

**Storage Format:**

```javascript
[
  {
    id: "1234567890",
    text: "Complete project",
    completed: false,
    createdAt: 1234567890,
  },
  {
    id: "1234567891",
    text: "Review code",
    completed: true,
    createdAt: 1234567891,
  },
];
```

### 4. QuickLinksPanel Component

**Responsibilities:**

- Manage collection of quick links
- Handle link creation and deletion
- Persist links to Local Storage
- Validate URL and label input
- Open links in new tabs

**State:**

```javascript
{
  links: QuickLink[]
}
```

**QuickLink Data Model:**

```javascript
{
  id: string,      // Unique identifier
  url: string,     // Full URL including protocol
  label: string    // Display text
}
```

**Key Methods:**

- `addLink(url, label)`: Create new link if inputs are valid
- `deleteLink(id)`: Remove link from list
- `validateLink(url, label)`: Returns true if both are non-empty
- `openLink(url)`: Opens URL in new tab using `window.open(url, '_blank')`
- `loadFromStorage()`: Retrieve links from Local Storage
- `saveToStorage()`: Persist current links to Local Storage
- `render()`: Update DOM with current link list

**Local Storage Key:** `"dashboard_links"`

**Storage Format:**

```javascript
[
  { id: "1234567890", url: "https://github.com", label: "GitHub" },
  {
    id: "1234567891",
    url: "https://stackoverflow.com",
    label: "Stack Overflow",
  },
];
```

## Data Models

### Task Model

```javascript
interface Task {
  id: string;           // Unique identifier (e.g., Date.now().toString())
  text: string;         // Task description (1-500 characters)
  completed: boolean;   // Completion status
  createdAt: number;    // Unix timestamp
}
```

**Validation Rules:**

- `text`: Must be non-empty after trimming whitespace
- `text`: Maximum length 500 characters (reasonable limit)
- `completed`: Boolean value
- `id`: Must be unique within task list

### QuickLink Model

```javascript
interface QuickLink {
  id: string;      // Unique identifier
  url: string;     // Full URL (must include protocol)
  label: string;   // Display text (1-50 characters)
}
```

**Validation Rules:**

- `url`: Must be non-empty after trimming
- `url`: Should include protocol (http:// or https://)
- `label`: Must be non-empty after trimming
- `label`: Maximum length 50 characters

### Local Storage Schema

**Tasks Storage:**

- Key: `"dashboard_tasks"`
- Value: JSON string of Task array
- Fallback: Empty array `[]` if not found or corrupted

**Links Storage:**

- Key: `"dashboard_links"`
- Value: JSON string of QuickLink array
- Fallback: Empty array `[]` if not found or corrupted

**Error Handling:**

- Wrap `JSON.parse()` in try-catch
- Log errors to console
- Return empty array on parse failure
- Never crash the application due to corrupted storage

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Time Formatting Correctness

_For any_ valid Date object, formatting the time SHALL produce a string matching the 12-hour format pattern "HH:MM:SS AM/PM" where HH is 01-12, MM and SS are 00-59, and the period is either AM or PM.

**Validates: Requirements 1.1**

### Property 2: Date Formatting Completeness

_For any_ valid Date object, formatting the date SHALL produce a string containing the day of week name, month name, and day number.

**Validates: Requirements 1.2, 1.4**

### Property 3: Greeting Correctness Across All Time Periods

_For any_ hour value (0-23), the greeting function SHALL return:

- "Good Morning" for hours 5-11
- "Good Afternoon" for hours 12-16
- "Good Evening" for hours 17-20
- "Good Night" for hours 21-23 and 0-4

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 4: Timer Display Formatting

_For any_ non-negative integer representing seconds (0-1500), formatting SHALL produce a string in "MM:SS" format where MM is 00-25 and SS is 00-59.

**Validates: Requirements 3.2**

### Property 5: Timer Reset Idempotence

_For any_ timer state with any remaining time value, calling reset SHALL set the remaining time to 1800 seconds, and calling reset again SHALL produce the same result (1800 seconds).

**Validates: Requirements 3.5**

### Property 6: Task Addition with Valid Input

_For any_ non-empty, non-whitespace string, adding it as a task SHALL increase the task list length by exactly 1 and the new task's text SHALL match the trimmed input string.

**Validates: Requirements 4.2**

### Property 7: Whitespace Task Rejection

_For any_ string composed entirely of whitespace characters (spaces, tabs, newlines), attempting to add it as a task SHALL be rejected and the task list SHALL remain unchanged in length and content.

**Validates: Requirements 4.4, 6.4**

### Property 8: Task Completion Toggle Round Trip

_For any_ task, toggling its completion status twice SHALL return the task to its original completion state.

**Validates: Requirements 5.2, 5.4**

### Property 9: Task Edit with Valid Input

_For any_ existing task and any non-empty, non-whitespace string, editing the task with the new string SHALL update the task's text to match the trimmed new string while preserving the task's ID and completion status.

**Validates: Requirements 6.3**

### Property 10: Task Edit Cancellation Preserves State

_For any_ task, entering edit mode and then canceling SHALL leave the task's text, completion status, and all other properties unchanged.

**Validates: Requirements 6.6**

### Property 11: Task Deletion Removes Specific Task

_For any_ task list and any task ID in that list, deleting the task SHALL reduce the list length by exactly 1 and the deleted task SHALL no longer be present in the list.

**Validates: Requirements 7.2**

### Property 12: Task Serialization Round Trip

_For any_ valid array of Task objects, serializing to JSON and then deserializing SHALL produce an equivalent array with the same tasks in the same order, preserving all task properties (id, text, completed, createdAt).

**Validates: Requirements 8.3**

### Property 13: Corrupted Storage Graceful Handling

_For any_ invalid JSON string (malformed, non-array, missing required fields), attempting to parse it as task data SHALL return an empty array without throwing an exception.

**Validates: Requirements 8.4**

### Property 14: Quick Link Addition with Valid Input

_For any_ non-empty, non-whitespace URL string and non-empty, non-whitespace label string, adding them as a quick link SHALL increase the links list length by exactly 1 and the new link SHALL contain the trimmed URL and label.

**Validates: Requirements 9.2**

### Property 15: Quick Link Invalid Input Rejection

_For any_ URL or label that is empty or contains only whitespace, attempting to add a quick link SHALL be rejected and the links list SHALL remain unchanged.

**Validates: Requirements 9.3**

### Property 16: Quick Link Deletion Removes Specific Link

_For any_ links list and any link ID in that list, deleting the link SHALL reduce the list length by exactly 1 and the deleted link SHALL no longer be present in the list.

**Validates: Requirements 9.5**

### Property 17: Quick Link Rendering Correctness

_For any_ quick link with a URL and label, rendering the link SHALL produce a clickable element where the displayed text matches the label and clicking triggers navigation to the URL.

**Validates: Requirements 10.2, 10.3**

### Property 18: Task Operations Persist to Storage

_For any_ task operation (add, edit, toggle completion, delete), the operation SHALL result in the updated task list being serialized and saved to Local Storage under the key "dashboard_tasks".

**Validates: Requirements 4.5, 5.5, 6.5, 7.3**

### Property 19: Link Operations Persist to Storage

_For any_ link operation (add, delete), the operation SHALL result in the updated links list being serialized and saved to Local Storage under the key "dashboard_links".

**Validates: Requirements 9.6**

## Error Handling

### Local Storage Errors

**Scenario**: Local Storage is unavailable (disabled, quota exceeded, or browser doesn't support it)

**Handling Strategy**:

1. Wrap all `localStorage.setItem()` calls in try-catch blocks
2. Log errors to console with descriptive messages
3. Continue application operation in memory-only mode
4. Display a non-intrusive warning to the user that data won't persist

**Implementation**:

```javascript
function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save to Local Storage: ${error.message}`);
    // Optionally show user notification
  }
}
```

### JSON Parse Errors

**Scenario**: Corrupted or invalid data in Local Storage

**Handling Strategy**:

1. Wrap all `JSON.parse()` calls in try-catch blocks
2. Return empty array/object as fallback
3. Log error to console
4. Clear corrupted data from storage to prevent repeated errors

**Implementation**:

```javascript
function loadFromStorage(key, defaultValue = []) {
  try {
    const data = localStorage.getItem(key);
    if (data === null) return defaultValue;
    return JSON.parse(data);
  } catch (error) {
    console.error(`Failed to parse data from Local Storage: ${error.message}`);
    localStorage.removeItem(key); // Clear corrupted data
    return defaultValue;
  }
}
```

### Timer Edge Cases

**Scenario**: Timer reaches 0 while running

**Handling Strategy**:

1. Stop the timer automatically when remaining time reaches 0
2. Clear the interval to prevent negative time values
3. Ensure UI shows "00:00" not negative values

**Scenario**: Multiple rapid clicks on timer controls

**Handling Strategy**:

1. Disable buttons during state transitions
2. Clear existing intervals before starting new ones
3. Prevent multiple simultaneous intervals

### Input Validation Errors

**Scenario**: User attempts to submit empty or whitespace-only input

**Handling Strategy**:

1. Trim input before validation
2. Check if trimmed length is 0
3. Prevent submission and maintain current state
4. Optionally provide visual feedback (e.g., shake animation, border color)

**Scenario**: User attempts to add extremely long task text

**Handling Strategy**:

1. Set maximum length attribute on input fields (500 characters for tasks)
2. Truncate if necessary before saving
3. Provide character count feedback in UI

### URL Validation for Quick Links

**Scenario**: User enters URL without protocol

**Handling Strategy**:

1. Check if URL starts with "http://" or "https://"
2. If not, prepend "https://" automatically
3. Validate URL format using basic regex or URL constructor
4. Reject obviously invalid URLs (e.g., just whitespace)

**Implementation**:

```javascript
function normalizeURL(url) {
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return "https://" + trimmed;
  }
  return trimmed;
}
```

## Testing Strategy

### Overview

The testing strategy employs a dual approach combining property-based testing for universal correctness properties and example-based unit testing for specific scenarios, edge cases, and integration points.

### Property-Based Testing

**Framework**: fast-check (JavaScript property-based testing library)

**Configuration**:

- Minimum 100 iterations per property test
- Each test tagged with feature name and property number
- Tag format: `Feature: todo-list-life-dashboard, Property {N}: {property description}`

**Property Test Coverage**:

1. **Time and Date Formatting** (Properties 1-3)
   - Generate random Date objects across full range (1970-2100)
   - Verify format patterns using regex
   - Test boundary hours (0, 4, 5, 11, 12, 16, 17, 20, 21, 23)

2. **Timer Logic** (Properties 4-5)
   - Generate random second values (0-10000)
   - Test formatting edge cases (0, 59, 60, 1500)
   - Verify reset idempotence with random initial states

3. **Task Operations** (Properties 6-13)
   - Generate random task lists (0-100 tasks)
   - Generate random strings (valid, whitespace, empty, special characters)
   - Test CRUD operations with random inputs
   - Verify serialization round trips with complex task data
   - Test error handling with malformed JSON

4. **Quick Links Operations** (Properties 14-19)
   - Generate random URLs (valid, invalid, with/without protocol)
   - Generate random labels (valid, whitespace, empty, special characters)
   - Test CRUD operations with random inputs
   - Verify persistence after operations

**Generator Strategies**:

- Use `fc.string()` with constraints for task text and labels
- Use `fc.webUrl()` for valid URLs
- Use `fc.whitespace()` for whitespace-only strings
- Use `fc.date()` for time/date testing
- Use `fc.integer()` for timer seconds
- Use `fc.array()` for task/link lists with size constraints

### Unit Testing

**Framework**: Jest or Vitest (modern JavaScript testing)

**Unit Test Coverage**:

1. **Component Initialization**
   - Verify components render with correct initial state
   - Test that required DOM elements are present
   - Verify default values are set correctly

2. **Specific Examples**
   - Timer initializes to 1500 seconds (Requirement 3.1)
   - Empty task list shows empty state (Requirement 7.4)
   - Specific greeting examples for each time period
   - Specific date formatting examples

3. **Edge Cases**
   - Timer reaches 00:00 and stops (Requirement 3.6)
   - Task list with 0 tasks
   - Task list with 100 tasks
   - Maximum length task text (500 characters)
   - URLs with special characters
   - Tasks with special characters in text

4. **Integration Points**
   - Local Storage read/write operations
   - DOM event handlers (click, submit, input)
   - setInterval/clearInterval for timer and time display
   - window.open for quick links

5. **Error Handling**
   - Local Storage unavailable
   - Corrupted JSON in storage
   - Invalid task/link data structures
   - Missing required fields in stored data

### Integration Testing

**Approach**: End-to-end testing with real browser environment

**Tools**: Playwright or Cypress

**Test Scenarios**:

1. Full user workflow: add tasks → mark complete → edit → delete
2. Full user workflow: add links → click links → delete links
3. Timer workflow: start → stop → reset → complete countdown
4. Data persistence: add data → reload page → verify data restored
5. Cross-browser compatibility testing (Chrome, Firefox, Safari, Edge)

### Performance Testing

**Requirements Validation**:

- Initial load time < 1 second (Requirement 11.1)
- Action response time < 100ms (Requirement 11.2)
- Responsive with 100 tasks (Requirement 11.4)

**Tools**: Lighthouse, Chrome DevTools Performance tab

**Metrics**:

- First Contentful Paint (FCP)
- Time to Interactive (TTI)
- Total Blocking Time (TBT)
- Action execution time (measured with performance.now())

### Test Organization

```
tests/
├── unit/
│   ├── greeting-display.test.js
│   ├── focus-timer.test.js
│   ├── task-list.test.js
│   └── quick-links.test.js
├── properties/
│   ├── time-formatting.property.test.js
│   ├── timer-logic.property.test.js
│   ├── task-operations.property.test.js
│   └── link-operations.property.test.js
├── integration/
│   ├── task-workflow.test.js
│   ├── link-workflow.test.js
│   ├── timer-workflow.test.js
│   └── persistence.test.js
└── e2e/
    ├── full-user-journey.spec.js
    └── cross-browser.spec.js
```

### Testing Priorities

**Priority 1 (Critical)**:

- Task CRUD operations and persistence (Properties 6-13, 18)
- Data serialization round trips (Property 12)
- Input validation (Properties 7, 15)

**Priority 2 (High)**:

- Timer functionality (Properties 4-5)
- Quick links operations (Properties 14-17, 19)
- Error handling for corrupted storage (Property 13)

**Priority 3 (Medium)**:

- Time and date formatting (Properties 1-2)
- Greeting logic (Property 3)
- UI rendering correctness

**Priority 4 (Low)**:

- Performance testing
- Cross-browser compatibility
- Visual design validation

### Continuous Integration

**CI Pipeline**:

1. Run all unit tests (fast, < 10 seconds)
2. Run all property tests (moderate, < 60 seconds)
3. Run integration tests (slower, < 5 minutes)
4. Run E2E tests on multiple browsers (slowest, < 15 minutes)
5. Generate coverage report (target: >80% line coverage)

**Pre-commit Hooks**:

- Run unit tests
- Run linter (ESLint)
- Run formatter (Prettier)

**Pull Request Requirements**:

- All tests passing
- No decrease in code coverage
- No new linter errors
