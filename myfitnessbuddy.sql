/* 
Exported SQL Statements for Myfitnessbuddy Database
*/

-- Table structure for users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table structure for sessions
CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_date DATE NOT NULL,
    session_no INT,
    name VARCHAR(100),
    start_time TIME,
    duration INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table structure for exercises
CREATE TABLE IF NOT EXISTS exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    muscle VARCHAR(50),
    equipment VARCHAR(50)
);

-- Table structure for session_exercises
CREATE TABLE IF NOT EXISTS session_exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    exercise_id INT NOT NULL,
    order_no INT,
    session_exercise_name VARCHAR(100),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

-- Table structure for exercise_sets
CREATE TABLE IF NOT EXISTS exercise_sets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_exercise_id INT NOT NULL,
    set_no INT,
    reps INT,
    weight FLOAT,
    FOREIGN KEY (session_exercise_id) REFERENCES session_exercises(id) ON DELETE CASCADE
);

-- Table structure for workout_template
CREATE TABLE IF NOT EXISTS workout_template (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table structure for workout_exercises_template
CREATE TABLE IF NOT EXISTS workout_exercises_template (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workout_template_id INT NOT NULL,
    exercise_id INT NOT NULL,
    exercise_name VARCHAR(100),
    order_no INT,
    FOREIGN KEY (workout_template_id) REFERENCES workout_template(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

-- Table structure for exercise_sets_template
CREATE TABLE IF NOT EXISTS exercise_sets_template (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workout_exercise_template_id INT NOT NULL,
    set_no INT,
    reps INT,
    weight FLOAT,
    FOREIGN KEY (workout_exercise_template_id) REFERENCES workout_exercises_template(id) ON DELETE CASCADE
);
