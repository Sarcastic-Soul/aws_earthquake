# Design Document

## Overview

The Earthquake-GitHub Correlator is a React-based single-page application that provides real-time visualization and correlation analysis between global earthquake data and GitHub repository activity. The system fetches data from the USGS Earthquake API and GitHub REST API, processes it for temporal correlation analysis, and presents interactive visualizations to help users explore potential relationships between seismic events and software development patterns.

The application follows a modular architecture with clear separation between data fetching, processing, and presentation layers. It uses modern React patterns with hooks for state management and implements real-time updates through periodic API polling.

## Architecture

The system follows a layered architecture pattern:

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│  (React Components, Charts, UI)         │
├─────────────────────────────────────────┤
│           Business Logic Layer          │
│  (Correlation Engine, Data Processing)  │
├─────────────────────────────────────────┤
│           Data Access Layer             │
│  (API Services, Caching, State)         │
├─────────────────────────────────────────┤
│           External APIs                 │
│  (USGS API, GitHub API)                 │
└─────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Client-side Processing**: All correlation analysis happens in the browser to avoid backend complexity
2. **Polling Strategy**: Uses periodic polling instead of WebSockets for simplicity and API compatibility
3. **State Management**: React Context API for global state, local state for component-specific data
4. **Caching Strategy**: Browser localStorage for user preferences, memory caching for API responses
5. **Responsive Design**: Mobile-first approach with progressive enhancement for desktop

## Components and Interfaces

### Core Components

#### Dashboard Component
- **Purpose**: Main container orchestrating all child components
- **Props**: None (root component)
- **State**: Global application state, loading states, error handling
- **Responsibilities**: Layout management, error boundaries, real-time update coordination

#### EarthquakeMap Component
- **Purpose**: Interactive world map displaying earthquake events
- **Props**: `earthquakeData: EarthquakeEvent[]`, `selectedTimeRange: TimeRange`, `onMarkerClick: (event: EarthquakeEvent) => void`
- **State**: Map zoom level, selected markers, tooltip visibility
- **Responsibilities**: Render earthquake markers, handle user interactions, coordinate with timeline

#### GitHubTimeline Component
- **Purpose**: Timeline visualization of repository commit activity
- **Props**: `commitData: CommitData[]`, `repository: Repository`, `highlightedPeriods: TimePeriod[]`
- **State**: Chart zoom level, selected time periods, hover states
- **Responsibilities**: Render commit timeline, highlight correlations, handle time selection

#### RepositorySelector Component
- **Purpose**: Interface for selecting and validating GitHub repositories
- **Props**: `currentRepository: Repository`, `onRepositoryChange: (repo: Repository) => void`
- **State**: Input validation, loading state, error messages
- **Responsibilities**: Repository URL validation, GitHub API connectivity testing

#### CorrelationPanel Component
- **Purpose**: Display statistical correlation metrics and analysis
- **Props**: `correlationData: CorrelationResult`, `confidence: number`
- **State**: Analysis parameters, display preferences
- **Responsibilities**: Statistical calculations display, significance testing results

#### FilterControls Component
- **Purpose**: User controls for data filtering and customization
- **Props**: `filters: FilterState`, `onFilterChange: (filters: FilterState) => void`
- **State**: Filter form state, validation
- **Responsibilities**: Time range selection, magnitude thresholds, data export options

### Service Interfaces

#### EarthquakeService
```typescript
interface EarthquakeService {
  fetchEarthquakes(params: EarthquakeQueryParams): Promise<EarthquakeEvent[]>
  validateTimeRange(startDate: Date, endDate: Date): boolean
  formatEarthquakeData(rawData: USGSResponse): EarthquakeEvent[]
}
```

#### GitHubService
```typescript
interface GitHubService {
  fetchCommitStats(repository: string, timeRange: TimeRange): Promise<CommitData[]>
  validateRepository(repoUrl: string): Promise<Repository>
  getRateLimitStatus(): Promise<RateLimitInfo>
}
```

#### CorrelationEngine
```typescript
interface CorrelationEngine {
  calculateCorrelation(earthquakes: EarthquakeEvent[], commits: CommitData[]): CorrelationResult
  findSignificantPeriods(data: CorrelationResult): TimePeriod[]
  generateStatistics(correlation: number): StatisticalSummary
}
```

## Data Models

### EarthquakeEvent
```typescript
interface EarthquakeEvent {
  id: string
  magnitude: number
  location: {
    latitude: number
    longitude: number
    place: string
  }
  timestamp: Date
  depth: number
  significance: number
}
```

### CommitData
```typescript
interface CommitData {
  timestamp: Date
  commitCount: number
  contributors: string[]
  repository: Repository
  additions: number
  deletions: number
}
```

### Repository
```typescript
interface Repository {
  owner: string
  name: string
  fullName: string
  url: string
  isValid: boolean
  lastUpdated: Date
}
```

### CorrelationResult
```typescript
interface CorrelationResult {
  coefficient: number
  pValue: number
  confidenceInterval: [number, number]
  significantPeriods: TimePeriod[]
  sampleSize: number
}
```

### FilterState
```typescript
interface FilterState {
  timeRange: {
    start: Date
    end: Date
  }
  magnitudeThreshold: number
  includeMinorEarthquakes: boolean
  repositoryFilters: string[]
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated to eliminate redundancy:

- Properties 1.1 and 1.2 (initial data loading) can be combined into a single initialization property
- Properties 4.1, 4.2, and 4.3 (visualization rendering) can be consolidated into a comprehensive visualization property
- Properties 3.1 and 3.2 (update intervals) can be combined into a single real-time update property
- Properties 6.2 and 6.3 (statistical display) can be merged into one comprehensive statistical display property

### Core Properties

**Property 1: Application initialization loads required data**
*For any* application startup, the system should fetch both earthquake data for the past 30 days and commit data for the default aws/aws-sdk-js repository
**Validates: Requirements 1.1, 1.2**

**Property 2: Data display completeness**
*For any* earthquake or commit dataset, all required information fields (magnitude, location, timestamp for earthquakes; commit counts, timestamps, contributors for GitHub data) should be displayed in the UI
**Validates: Requirements 1.3, 1.4**

**Property 3: Visualization rendering consistency**
*For any* combination of earthquake and GitHub datasets, the system should render appropriate visualizations including world map with magnitude-based markers, timeline charts, and overlay comparisons
**Validates: Requirements 1.5, 4.1, 4.2, 4.3**

**Property 4: Repository validation accuracy**
*For any* GitHub repository URL input, the system should correctly identify valid repositories and reject invalid ones with appropriate error handling
**Validates: Requirements 2.2, 2.5**

**Property 5: Repository selection workflow**
*For any* valid repository selection, the system should fetch new commit data and update all visualizations to reflect the new repository's statistics
**Validates: Requirements 2.3, 2.4**

**Property 6: Real-time update intervals**
*For any* active real-time updater, earthquake data should refresh every 15 minutes and GitHub data should refresh every 10 minutes
**Validates: Requirements 3.1, 3.2**

**Property 7: State preservation during updates**
*For any* data update operation, user preferences including repository selection and view settings should remain unchanged
**Validates: Requirements 3.4**

**Property 8: Network error retry mechanism**
*For any* network failure during API requests, the system should retry up to 3 times before displaying error status
**Validates: Requirements 3.5**

**Property 9: Interactive tooltip behavior**
*For any* data point hover interaction, detailed information should be displayed in tooltips without affecting the underlying visualization
**Validates: Requirements 4.4**

**Property 10: Cross-visualization interaction**
*For any* earthquake marker click, corresponding time periods should be highlighted in the GitHub timeline visualization
**Validates: Requirements 4.5**

**Property 11: Filter application consistency**
*For any* filter change (time range or magnitude threshold), both earthquake and GitHub datasets should be updated to match the selected criteria
**Validates: Requirements 5.1, 5.2**

**Property 12: Correlation recalculation accuracy**
*For any* filter application, correlation metrics should be recalculated using only the filtered dataset
**Validates: Requirements 5.3**

**Property 13: Rate limit validation**
*For any* custom date range selection, the system should validate that the range does not exceed API rate limits before making requests
**Validates: Requirements 5.4**

**Property 14: Preference persistence**
*For any* filter setting change, the new preferences should be immediately saved to browser local storage
**Validates: Requirements 5.5**

**Property 15: Correlation calculation completeness**
*For any* pair of earthquake and GitHub datasets, the system should calculate temporal correlation coefficients with proper statistical analysis
**Validates: Requirements 6.1**

**Property 16: Statistical display completeness**
*For any* correlation analysis result, the system should display significance indicators, confidence intervals, and p-values
**Validates: Requirements 6.2, 6.3**

**Property 17: Correlation highlighting accuracy**
*For any* correlation analysis, time periods with the strongest correlations should be visually highlighted in the interface
**Validates: Requirements 6.4**

**Property 18: Time zone normalization**
*For any* correlation analysis, earthquake timestamps from different time zones should be properly normalized to align with repository activity timestamps
**Validates: Requirements 6.5**

## Error Handling

### API Error Handling
- **Network Failures**: Implement exponential backoff retry strategy with maximum 3 attempts
- **Rate Limiting**: Detect rate limit responses and implement appropriate delays
- **Invalid Responses**: Validate API response schemas and handle malformed data gracefully
- **Timeout Handling**: Set reasonable timeouts for API requests (30 seconds for USGS, 15 seconds for GitHub)

### User Input Validation
- **Repository URLs**: Validate GitHub repository URL format and accessibility
- **Date Ranges**: Ensure date ranges are valid and within API limits
- **Magnitude Thresholds**: Validate magnitude values are within realistic ranges (0-10)

### Data Processing Errors
- **Correlation Calculation**: Handle edge cases like insufficient data points or identical datasets
- **Time Zone Conversion**: Gracefully handle invalid or missing timezone information
- **Statistical Analysis**: Validate input data quality before performing statistical calculations

### UI Error States
- **Loading States**: Show appropriate loading indicators during data fetching
- **Empty States**: Display helpful messages when no data is available
- **Error Messages**: Provide clear, actionable error messages to users
- **Fallback UI**: Maintain basic functionality even when some features fail

## Testing Strategy

### Dual Testing Approach

The application will use both unit testing and property-based testing to ensure comprehensive coverage:

- **Unit tests** verify specific examples, edge cases, and error conditions
- **Property tests** verify universal properties that should hold across all inputs
- Together they provide comprehensive coverage: unit tests catch concrete bugs, property tests verify general correctness

### Unit Testing

Unit tests will focus on:
- Component rendering with specific data sets
- API service functions with known inputs and outputs
- Error handling with specific error conditions
- User interaction flows with predetermined steps
- Statistical calculation functions with known mathematical results

**Testing Framework**: Jest with React Testing Library for component testing

### Property-Based Testing

Property-based tests will verify the correctness properties defined above using generated test data:

- **Testing Framework**: fast-check for JavaScript property-based testing
- **Test Configuration**: Minimum 100 iterations per property test to ensure statistical confidence
- **Data Generators**: Custom generators for earthquake events, commit data, repository URLs, and time ranges
- **Property Annotation**: Each property-based test will be tagged with the format: `**Feature: earthquake-github-correlator, Property {number}: {property_text}**`

### Integration Testing

- **API Integration**: Test actual API connectivity and response handling
- **Cross-Component Communication**: Verify data flow between components
- **Real-Time Updates**: Test periodic update mechanisms
- **State Management**: Verify global state consistency across component updates

### Performance Testing

- **Large Dataset Handling**: Test with maximum expected data volumes
- **Correlation Calculation Performance**: Verify statistical calculations complete within acceptable time limits
- **Memory Usage**: Monitor memory consumption during extended real-time operation
- **Rendering Performance**: Ensure smooth visualization updates with large datasets

### Accessibility Testing

- **Keyboard Navigation**: Verify all interactive elements are keyboard accessible
- **Screen Reader Compatibility**: Test with screen reader software
- **Color Contrast**: Ensure visualizations meet WCAG accessibility standards
- **Focus Management**: Verify proper focus handling during dynamic updates