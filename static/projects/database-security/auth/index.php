<?php
    if (isset($_POST['username'])) {
        $db = sqlite_open("db.sqlite"); 

        $username = $_POST['username'];
        $password = $_POST['password'];
        $result = sqlite_query($db, "
            select username from users where
                username = '$username' and password = '$password'
        ") or die("Error: "
            . sqlite_error_string(sqlite_last_error($db)));
        if ($row = sqlite_fetch_array($result)) {
            echo "Welcome " . $row[0] . "!";
        }
        else {
            echo "Authentication failure";
        }
    }
    else {
        ?>
        <form method="post" action="index.php">
            <input type="text" name="username" size="100" />
            <br />
            <input type="password" name="password" size="100" />
            <br />
            <input type="submit" value="login" />
        </form>
        <?php
    }
?>
