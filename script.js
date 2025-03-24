// IndexedDB setup
let db;
const DB_NAME = 'gym-tracker-db';
const DB_VERSION = 1;
const STORE_NAME = 'workouts';

// Initialize the database
function initDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = (event) => {
            console.error('Database error:', event.target.error);
            reject('Could not open database');
        };
        
        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('Database opened successfully');
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create object store with auto-incrementing ID
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                
                // Create indexes
                store.createIndex('date', 'date', { unique: false });
                store.createIndex('muscleGroup', 'muscleGroup', { unique: false });
                store.createIndex('exercise', 'exercise', { unique: false });
            }
            
            console.log('Database setup complete');
        };
    });
}

// Functions to interact with the database
function addWorkout(workout) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(workout);
        
        request.onsuccess = () => {
            resolve(request.result);
        };
        
        request.onerror = (event) => {
            console.error('Error adding workout:', event.target.error);
            reject('Failed to add workout');
        };
    });
}

function getAllWorkouts() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = () => {
            resolve(request.result);
        };
        
        request.onerror = (event) => {
            console.error('Error fetching workouts:', event.target.error);
            reject('Failed to fetch workouts');
        };
    });
}

function getWorkoutsByDate(date) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('date');
        const request = index.getAll(date);
        
        request.onsuccess = () => {
            resolve(request.result);
        };
        
        request.onerror = (event) => {
            console.error('Error fetching workouts by date:', event.target.error);
            reject('Failed to fetch workouts by date');
        };
    });
}

function updateWorkout(workout) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(workout);
        
        request.onsuccess = () => {
            resolve(request.result);
        };
        
        request.onerror = (event) => {
            console.error('Error updating workout:', event.target.error);
            reject('Failed to update workout');
        };
    });
}

function deleteWorkout(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);
        
        request.onsuccess = () => {
            resolve('Workout deleted successfully');
        };
        
        request.onerror = (event) => {
            console.error('Error deleting workout:', event.target.error);
            reject('Failed to delete workout');
        };
    });
}

// Add function to get a single workout by ID
function getWorkoutById(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);
        
        request.onsuccess = () => {
            if (request.result) {
                resolve(request.result);
            } else {
                reject('Workout not found');
            }
        };
        
        request.onerror = (event) => {
            console.error('Error fetching workout:', event.target.error);
            reject('Failed to fetch workout');
        };
    });
}

// UI Functions
function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : ''}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Make toast visible
    setTimeout(() => {
        toast.classList.add('visible');
    }, 100);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

function renderWorkoutTable(workouts) {
    const tableBody = document.getElementById('workout-list');
    const noDataDiv = document.getElementById('no-data');
    
    tableBody.innerHTML = '';
    
    if (workouts.length === 0) {
        noDataDiv.classList.remove('hidden');
    } else {
        noDataDiv.classList.add('hidden');
        
        workouts.forEach(workout => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', workout.id);
            
            // Format the exercise display with muscle group and exercise name
            const exerciseDisplay = `<div class="exercise-cell">
                <div class="muscle-group">${workout.muscleGroup}</div>
                <div class="exercise-name">${workout.exercise}</div>
            </div>`;
            
            // Format the volume display with sets, reps, and weight
            const volumeDisplay = `<div class="volume-cell">
                <div>${workout.sets} sets</div>
                <div>${workout.reps} reps</div>
                <div>${workout.weight}</div>
            </div>`;
            
            // Create action buttons with icons
            const actionsDisplay = `<div class="action-btns">
                <button class="icon-btn edit-btn" title="Edit">✏️</button>
                <button class="icon-btn delete-btn" title="Delete">🗑️</button>
            </div>`;
            
            row.innerHTML = `
                <td>${workout.date}</td>
                <td>${exerciseDisplay}</td>
                <td>${volumeDisplay}</td>
                <td>${actionsDisplay}</td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', handleEditWorkout);
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDeleteWorkout);
        });
    }
}

// Event handlers
async function handleAddWorkout(event) {
    event.preventDefault();
    
    const date = document.getElementById('workout-date').value;
    const muscleGroup = document.getElementById('muscle-group').value;
    const exercise = document.getElementById('exercise').value;
    const sets = document.getElementById('sets').value;
    const reps = document.getElementById('reps').value;
    const weight = document.getElementById('weight').value;
    
    if (!date || !muscleGroup || !exercise || !sets || !reps || !weight) {
        showToast('Please fill in all fields', true);
        return;
    }
    
    const workout = {
        date,
        muscleGroup,
        exercise,
        sets: parseInt(sets, 10),
        reps,
        weight
    };
    
    try {
        const id = await addWorkout(workout);
        workout.id = id;
        showToast('Workout added successfully');
        document.getElementById('add-workout-form').reset();
        
        // Reset form state
        const submitBtn = document.querySelector('#add-workout-form button[type="submit"]');
        submitBtn.textContent = 'Add Exercise';
        submitBtn.classList.remove('editing');
        
        // Set today's date as default
        document.getElementById('workout-date').value = formatDate(new Date());
        
        // Reload workouts
        loadWorkouts();
    } catch (error) {
        showToast('Failed to add workout', true);
    }
}

async function handleDeleteWorkout(event) {
    const row = event.target.closest('tr');
    const id = parseInt(row.getAttribute('data-id'), 10);
    
    if (confirm('Are you sure you want to delete this workout?')) {
        try {
            await deleteWorkout(id);
            showToast('Workout deleted successfully');
            row.remove();
            
            // Check if table is empty
            if (document.getElementById('workout-list').children.length === 0) {
                document.getElementById('no-data').classList.remove('hidden');
            }
        } catch (error) {
            showToast('Failed to delete workout', true);
        }
    }
}

let currentEditId = null;

async function handleEditWorkout(event) {
    const row = event.target.closest('tr');
    const id = parseInt(row.getAttribute('data-id'), 10);
    currentEditId = id;
    
    try {
        // Get the workout directly from the database
        const workout = await getWorkoutById(id);
        
        // Fill the form with the workout data
        document.getElementById('workout-date').value = workout.date;
        document.getElementById('muscle-group').value = workout.muscleGroup;
        document.getElementById('exercise').value = workout.exercise;
        document.getElementById('sets').value = workout.sets;
        document.getElementById('reps').value = workout.reps;
        document.getElementById('weight').value = workout.weight;
        
        // Change button text
        const submitBtn = document.querySelector('#add-workout-form button[type="submit"]');
        submitBtn.textContent = 'Update Exercise';
        submitBtn.classList.add('editing');
        
        // Scroll to form
        document.getElementById('workout-form').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        showToast('Failed to load workout data for editing', true);
        console.error('Error loading workout data:', error);
    }
}

async function handleUpdateWorkout(event) {
    event.preventDefault();
    
    const date = document.getElementById('workout-date').value;
    const muscleGroup = document.getElementById('muscle-group').value;
    const exercise = document.getElementById('exercise').value;
    const sets = document.getElementById('sets').value;
    const reps = document.getElementById('reps').value;
    const weight = document.getElementById('weight').value;
    
    if (!date || !muscleGroup || !exercise || !sets || !reps || !weight) {
        showToast('Please fill in all fields', true);
        return;
    }
    
    const workout = {
        id: currentEditId,
        date,
        muscleGroup,
        exercise,
        sets: parseInt(sets, 10),
        reps,
        weight
    };
    
    try {
        await updateWorkout(workout);
        showToast('Workout updated successfully');
        document.getElementById('add-workout-form').reset();
        
        // Reset form state
        const submitBtn = document.querySelector('#add-workout-form button[type="submit"]');
        submitBtn.textContent = 'Add Exercise';
        submitBtn.classList.remove('editing');
        currentEditId = null;
        
        // Set today's date as default
        document.getElementById('workout-date').value = formatDate(new Date());
        
        // Reload workouts
        loadWorkouts();
    } catch (error) {
        showToast('Failed to update workout', true);
    }
}

async function handleFilterByDate() {
    const filterDate = document.getElementById('date-filter').value;
    
    if (filterDate) {
        try {
            const workouts = await getWorkoutsByDate(filterDate);
            renderWorkoutTable(workouts);
        } catch (error) {
            showToast('Failed to filter workouts', true);
        }
    } else {
        loadWorkouts();
    }
}

function handleClearFilter() {
    document.getElementById('date-filter').value = '';
    loadWorkouts();
}

// Main function to load workouts from the database
async function loadWorkouts() {
    try {
        const workouts = await getAllWorkouts();
        
        // Sort workouts by date (most recent first)
        workouts.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;  // Descending order (most recent first)
        });
        
        renderWorkoutTable(workouts);
        updateAutocompleteLists(workouts);
    } catch (error) {
        showToast('Failed to load workouts', true);
    }
}

// Function to update autocomplete lists
function updateAutocompleteLists(workouts) {
    // Extract unique muscle groups
    const muscleGroups = new Set();
    
    // Create a map of muscle groups to their exercises
    const exercisesByMuscleGroup = {};
    
    workouts.forEach(workout => {
        const muscleGroup = workout.muscleGroup;
        const exercise = workout.exercise;
        
        muscleGroups.add(muscleGroup);
        
        // Initialize array for this muscle group if it doesn't exist
        if (!exercisesByMuscleGroup[muscleGroup]) {
            exercisesByMuscleGroup[muscleGroup] = new Set();
        }
        
        // Add this exercise to the set for this muscle group
        exercisesByMuscleGroup[muscleGroup].add(exercise);
    });
    
    // Store the mapping in a data attribute on the form for later use
    const form = document.getElementById('add-workout-form');
    form.dataset.exercisesByMuscleGroup = JSON.stringify(
        Object.fromEntries(
            Object.entries(exercisesByMuscleGroup).map(
                ([group, exercises]) => [group, [...exercises]]
            )
        )
    );
    
    // Update muscle group datalist
    const muscleGroupList = document.getElementById('muscle-group-list');
    muscleGroupList.innerHTML = '';
    
    muscleGroups.forEach(group => {
        const option = document.createElement('option');
        option.value = group;
        muscleGroupList.appendChild(option);
    });
    
    // Set up event listener for muscle group changes
    const muscleGroupInput = document.getElementById('muscle-group');
    
    // Remove existing listener if it exists
    const newMuscleGroupInput = muscleGroupInput.cloneNode(true);
    muscleGroupInput.parentNode.replaceChild(newMuscleGroupInput, muscleGroupInput);
    
    // Add new listener
    newMuscleGroupInput.addEventListener('input', updateExerciseOptions);
    
    // Initial update of exercise options
    updateExerciseOptions();
}

// Function to update exercise options based on selected muscle group
function updateExerciseOptions() {
    const muscleGroupInput = document.getElementById('muscle-group');
    const exerciseList = document.getElementById('exercise-list');
    const selectedMuscleGroup = muscleGroupInput.value.trim();
    
    // Clear the current options
    exerciseList.innerHTML = '';
    
    if (!selectedMuscleGroup) {
        return; // No muscle group selected
    }
    
    // Get the stored exercise mapping
    const form = document.getElementById('add-workout-form');
    const exercisesByMuscleGroup = JSON.parse(form.dataset.exercisesByMuscleGroup || '{}');
    
    // Get exercises for this muscle group
    const exercises = exercisesByMuscleGroup[selectedMuscleGroup] || [];
    
    // Add options to the datalist
    exercises.forEach(exercise => {
        const option = document.createElement('option');
        option.value = exercise;
        exerciseList.appendChild(option);
    });
    
    // Reset exercise field value when muscle group changes
    document.getElementById('exercise').value = '';
    
    // Also reset sets, reps and weight fields
    document.getElementById('sets').value = '';
    document.getElementById('reps').value = '';
    document.getElementById('weight').value = '';
}

// Function to populate previous workout data when an exercise is selected
async function populatePreviousWorkoutData() {
    const muscleGroup = document.getElementById('muscle-group').value.trim();
    const exercise = document.getElementById('exercise').value.trim();
    
    if (!muscleGroup || !exercise) {
        return; // Need both muscle group and exercise
    }
    
    try {
        // Get all workouts
        const workouts = await getAllWorkouts();
        
        // Filter workouts for this specific muscle group and exercise
        const matchingWorkouts = workouts.filter(workout => 
            workout.muscleGroup === muscleGroup && 
            workout.exercise === exercise
        );
        
        if (matchingWorkouts.length === 0) {
            return; // No matching workouts found
        }
        
        // Sort by date descending to get the most recent workout
        matchingWorkouts.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
        });
        
        // Get the most recent workout for this exercise
        const mostRecent = matchingWorkouts[0];
        
        // Auto-populate the form fields
        document.getElementById('sets').value = mostRecent.sets;
        document.getElementById('reps').value = mostRecent.reps;
        document.getElementById('weight').value = mostRecent.weight;
        
    } catch (error) {
        console.error('Error fetching previous workout data:', error);
    }
}

// Export workouts to CSV
async function exportWorkoutsToCSV() {
    try {
        const workouts = await getAllWorkouts();
        
        if (workouts.length === 0) {
            showToast('No workout data to export', true);
            return;
        }
        
        // CSV header
        let csvContent = 'Date,Muscle Group,Exercise,Sets,Reps,Weight\n';
        
        // Add workout data rows
        workouts.forEach(workout => {
            // Format the data and handle any commas by enclosing in quotes
            const date = workout.date;
            const muscleGroup = `"${workout.muscleGroup.replace(/"/g, '""')}"`;
            const exercise = `"${workout.exercise.replace(/"/g, '""')}"`;
            const sets = workout.sets;
            const reps = `"${workout.reps.replace(/"/g, '""')}"`;
            const weight = `"${workout.weight.replace(/"/g, '""')}"`;
            
            // Add row to CSV
            csvContent += `${date},${muscleGroup},${exercise},${sets},${reps},${weight}\n`;
        });
        
        // Create blob and download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        // Create temporary link element
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `gym-tracker-export-${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.display = 'none';
        
        // Add link to document, trigger click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Release the URL object
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);
        
        showToast('Workout data exported successfully');
    } catch (error) {
        console.error('Error exporting workouts:', error);
        showToast('Failed to export workout data', true);
    }
}

// Import workouts from CSV
function importCSVFile() {
    // Trigger the hidden file input
    document.getElementById('csv-file-input').click();
}

// Process the CSV file
async function processCSVFile(file) {
    try {
        const contents = await readFile(file);
        const workouts = parseCSV(contents);
        
        if (workouts.length === 0) {
            showToast('No valid workout data found in the CSV file', true);
            return;
        }
        
        // Confirm import
        if (confirm(`Are you sure you want to import ${workouts.length} workout(s)? This won't overwrite existing workouts.`)) {
            await importWorkouts(workouts);
            showToast(`Successfully imported ${workouts.length} workout(s)`);
            await loadWorkouts(); // Refresh the table
        }
    } catch (error) {
        console.error('Error importing CSV:', error);
        showToast('Failed to import CSV file: ' + error.message, true);
    }
}

// Read file contents as text
function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            resolve(e.target.result);
        };
        
        reader.onerror = (e) => {
            reject(new Error('Error reading file'));
        };
        
        reader.readAsText(file);
    });
}

// Parse CSV content into workout objects
function parseCSV(csvContent) {
    const lines = csvContent.split('\n');
    const workouts = [];
    
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        try {
            // Parse the CSV line, handling quoted fields
            const values = parseCSVLine(line);
            
            if (values.length !== 6) {
                console.warn(`Skipping invalid line: ${line}`);
                continue;
            }
            
            const [date, muscleGroup, exercise, sets, reps, weight] = values;
            
            // Validate required fields
            if (!date || !muscleGroup || !exercise || !sets || !reps || !weight) {
                console.warn(`Skipping line with missing data: ${line}`);
                continue;
            }
            
            workouts.push({
                date,
                muscleGroup,
                exercise,
                sets: parseInt(sets, 10) || 0,
                reps,
                weight
            });
        } catch (error) {
            console.warn(`Error parsing line: ${line}`, error);
        }
    }
    
    return workouts;
}

// Parse a CSV line, handling quoted fields
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            // Handle escaped quotes (two double quotes in a row)
            if (i + 1 < line.length && line[i + 1] === '"') {
                current += '"';
                i++; // Skip the next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // End of field
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    // Add the last field
    result.push(current);
    return result;
}

// Import workout data into IndexedDB
async function importWorkouts(workouts) {
    for (const workout of workouts) {
        await addWorkout(workout);
    }
}

// Show update notification
function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <div class="update-message">
            <span>A new version is available!</span>
            <button id="update-btn">Update Now</button>
            <button id="dismiss-btn">Later</button>
        </div>
    `;
    document.body.appendChild(notification);
    
    // Add event listeners
    document.getElementById('update-btn').addEventListener('click', () => {
        window.location.reload();
    });
    
    document.getElementById('dismiss-btn').addEventListener('click', () => {
        notification.remove();
    });
}

// Entry point - Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initDatabase();
        
        // Set today's date as default
        document.getElementById('workout-date').value = formatDate(new Date());
        
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./service-worker.js')
                .then(registration => {
                    console.log('Service Worker registered with scope:', registration.scope);
                    
                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                showUpdateNotification();
                            }
                        });
                    });
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
                
            // Listen for controller change (indicates an update)
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('New service worker activated');
            });
        }
        
        // Add event listeners
        const form = document.getElementById('add-workout-form');
        form.addEventListener('submit', (event) => {
            if (currentEditId !== null) {
                handleUpdateWorkout(event);
            } else {
                handleAddWorkout(event);
            }
        });
        
        document.getElementById('date-filter').addEventListener('change', handleFilterByDate);
        document.getElementById('clear-filter').addEventListener('click', handleClearFilter);
        
        // Export CSV button
        const exportCsvBtn = document.getElementById('export-csv-btn');
        if (exportCsvBtn) {
            exportCsvBtn.addEventListener('click', exportWorkoutsToCSV);
        }
        
        // Import CSV button
        const importCsvBtn = document.getElementById('import-csv-btn');
        if (importCsvBtn) {
            importCsvBtn.addEventListener('click', importCSVFile);
        }
        
        // CSV file input change
        const csvFileInput = document.getElementById('csv-file-input');
        if (csvFileInput) {
            csvFileInput.addEventListener('change', (event) => {
                if (event.target.files.length > 0) {
                    processCSVFile(event.target.files[0]);
                    // Reset the input so the same file can be selected again
                    event.target.value = '';
                }
            });
        }
        
        // Add event listener for exercise field
        document.getElementById('exercise').addEventListener('change', populatePreviousWorkoutData);
        
        // Load initial data
        loadWorkouts();
        
        showToast('App initialized successfully');
    } catch (error) {
        showToast('Failed to initialize app', true);
    }
});
