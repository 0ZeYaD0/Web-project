<?php
// Start session
session_start();

// Database configuration
$db_host = 'localhost';
$db_user = 'root';
$db_pass = 'root';
$db_name = 'animanga_db';

// Connect to database
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Initialize response array
$response = [
    'success' => false,
    'message' => '',
    'redirect' => ''
];

// Process registration
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get and sanitize inputs
    $name = filter_var($_POST['name'] ?? '', FILTER_SANITIZE_STRING);
    $email = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm-password'] ?? '';
    
    // Validate inputs
    if (empty($name) || empty($email) || empty($password) || empty($confirm_password)) {
        $response['message'] = 'Please fill in all required fields.';
    } 
    else if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['message'] = 'Please enter a valid email address.';
    }
    else if (strlen($password) < 8) {
        $response['message'] = 'Password must be at least 8 characters long.';
    }
    else if ($password !== $confirm_password) {
        $response['message'] = 'Passwords do not match.';
    }
    else {
        // Check if email already exists
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $response['message'] = 'Email already in use. Please use a different email or login.';
        } else {
            // Hash password
            $password_hash = password_hash($password, PASSWORD_DEFAULT);
            
            // Insert new user
            $stmt = $conn->prepare("INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())");
            $stmt->bind_param("sss", $name, $email, $password_hash);
            
            if ($stmt->execute()) {
                $user_id = $conn->insert_id;
                
                // Set session variables
                $_SESSION['user_id'] = $user_id;
                $_SESSION['user_name'] = $name;
                $_SESSION['user_email'] = $email;
                $_SESSION['logged_in'] = true;
                
                $response['success'] = true;
                $response['message'] = 'Registration successful!';
                $response['redirect'] = 'index.html';
            } else {
                $response['message'] = 'Registration failed. Please try again.';
            }
        }
        $stmt->close();
    }
    
    // Return JSON response for AJAX requests
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}

// For direct access to the page (non-AJAX)
if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    header('Location: index.html');
    exit;
}
?>