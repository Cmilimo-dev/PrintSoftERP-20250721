# Android ERP Unit Tests

## Current Status: ⚠️ AWAITING BUILD FIXES

The unit tests in this directory are prepared but **cannot run** until the critical build errors in the main project are resolved.

## Build Issues to Resolve First

1. **Model Import Conflicts**: Fix package inconsistencies between `com.printsoft.erp.data.model.*` and `com.printsoft.erp.data.models.*`
2. **Missing Classes**: Uncomment and fix SettingsViewModel, add missing model fields
3. **Type Mismatches**: Resolve 500+ compilation errors throughout the project

## Test Structure

Once build issues are resolved, this directory contains:

### BusinessDocumentWorkflowServiceTest
- Tests quotation creation and document number generation
- Tests document conversion workflows (quotation → sales order → invoice)
- Tests status transition validation
- Tests next action determination logic
- Tests error handling for invalid operations

### Planned Additional Tests
- **ViewModelTests**: Testing UI layer business logic
- **RepositoryTests**: Testing data access layer
- **ApiServiceTests**: Testing network layer integration
- **DatabaseTests**: Testing local data persistence

## Test Dependencies Required

Add these to `app/build.gradle` after build issues are resolved:

```kotlin
dependencies {
    // Unit Testing
    testImplementation 'junit:junit:4.13.2'
    testImplementation 'org.mockito:mockito-core:4.11.0'
    testImplementation 'org.mockito.kotlin:mockito-kotlin:4.1.0'
    testImplementation 'org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3'
    testImplementation 'androidx.arch.core:core-testing:2.2.0'
    
    // Android Testing
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
    androidTestImplementation 'androidx.compose.ui:ui-test-junit4:1.5.8'
}
```

## Running Tests

Once build is fixed, run tests with:

```bash
# Run all unit tests
./gradlew test

# Run specific test class
./gradlew test --tests BusinessDocumentWorkflowServiceTest

# Run with coverage report
./gradlew testDebugUnitTestCoverage
```

## Next Steps

1. **Fix Build First**: Resolve all compilation errors
2. **Add Test Dependencies**: Update build.gradle
3. **Enable Tests**: Run initial test suite
4. **Expand Coverage**: Add tests for remaining components
5. **Integration Tests**: Add end-to-end workflow tests

## Test Coverage Goals

- **Business Logic**: 80%+ coverage for services and ViewModels
- **Data Layer**: 70%+ coverage for repositories and DAOs  
- **UI Layer**: 60%+ coverage for complex UI logic
- **Integration**: Key user workflows end-to-end
