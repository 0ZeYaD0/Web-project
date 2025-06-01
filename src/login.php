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

// Process login
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get and sanitize inputs
    $email = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'] ?? '';
    $remember = isset($_POST['remember']) ? true : false;
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['message'] = 'Please enter a valid email address.';
    } 
    // Validate that both fields are provided
    else if (empty($email) || empty($password)) {
        $response['message'] = 'Please fill in all required fields.';
    } 
    // Process login request
    else {
        // Prepare SQL with parameterized query (prevents SQL injection)
        $stmt = $conn->prepare("SELECT id, name, email, password FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();
            
            // Verify password
            if (password_verify($password, $user['password'])) {
                // Set session variables
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_name'] = $user['name'];
                $_SESSION['user_email'] = $user['email'];
                $_SESSION['logged_in'] = true;
                
                // Set remember me cookie if checked (30 days)
                if ($remember) {
                    $selector = bin2hex(random_bytes(16));
                    $validator = bin2hex(random_bytes(32));
                    $token = $selector . ':' . $validator;
                    
                    // Store the token hash in database
                    $expires = date('Y-m-d H:i:s', time() + 30 * 24 * 60 * 60);
                    $token_hash = password_hash($validator, PASSWORD_DEFAULT);
                    
                    // Remove any existing tokens for this user
                    $stmt = $conn->prepare("DELETE FROM auth_tokens WHERE user_id = ?");
                    $stmt->bind_param("i", $user['id']);
                    $stmt->execute();
                    
                    // Insert new token
                    $stmt = $conn->prepare("INSERT INTO auth_tokens (user_id, selector, token, expires) VALUES (?, ?, ?, ?)");
                    $stmt->bind_param("isss", $user['id'], $selector, $token_hash, $expires);
                    $stmt->execute();
                    
                    // Set cookie
                    setcookie(
                        'remember_me',
                        $token,
                        time() + 30 * 24 * 60 * 60, // 30 days
                        '/',
                        '',
                        true,  // secure
                        true   // httponly
                    );
                }
                
                // Success!
                $response['success'] = true;
                $response['message'] = 'Login successful!';
                $response['redirect'] = 'index.html';
            } else {
                $response['message'] = 'Incorrect email or password.';
            }
        } else {
            $response['message'] = 'Incorrect email or password.';
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