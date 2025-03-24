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
            
            row.innerHTML = `
                <td>${workout.date}</td>
                <td>${workout.muscleGroup}</td>
                <td>${workout.exercise}</td>
                <td>${workout.sets}</td>
                <td>${workout.reps}</td>
                <td>${workout.weight}</td>
                <td class="action-btns">
                    <button class="btn-secondary edit-btn">Edit</button>
                    <button class="btn-danger delete-btn">Delete</button>
                </td>
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

function handleEditWorkout(event) {
    const row = event.target.closest('tr');
    const id = parseInt(row.getAttribute('data-id'), 10);
    currentEditId = id;
    
    // Get data from the row
    const cells = row.querySelectorAll('td');
    const date = cells[0].textContent;
    const muscleGroup = cells[1].textContent;
    const exercise = cells[2].textContent;
    const sets = cells[3].textContent;
    const reps = cells[4].textContent;
    const weight = cells[5].textContent;
    
    // Fill the form
    document.getElementById('workout-date').value = date;
    document.getElementById('muscle-group').value = muscleGroup;
    document.getElementById('exercise').value = exercise;
    document.getElementById('sets').value = sets;
    document.getElementById('reps').value = reps;
    document.getElementById('weight').value = weight;
    
    // Change button text
    const submitBtn = document.querySelector('#add-workout-form button[type="submit"]');
    submitBtn.textContent = 'Update Exercise';
    submitBtn.classList.add('editing');
    
    // Scroll to form
    document.getElementById('workout-form').scrollIntoView({ behavior: 'smooth' });
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
        renderWorkoutTable(workouts);
    } catch (error) {
        showToast('Failed to load workouts', true);
    }
}

// Entry point - Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initDatabase();
        
        // Set today's date as default
        document.getElementById('workout-date').value = formatDate(new Date());
        
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
        
        // Load initial data
        loadWorkouts();
        
        showToast('App initialized successfully');
    } catch (error) {
        showToast('Failed to initialize app', true);
    }
});
