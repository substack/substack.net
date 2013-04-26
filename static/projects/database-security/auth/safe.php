<?php
    if (isset($_POST['username'])) {
        $db = sqlite_open("db.sqlite"); 

        $sth = $db->prepare("
            select username from users where
                username = '?' and password = '?'
        ");
        $sth->execute($_POST["username"], $_POST["password"])
            or die("Error: " . sqlite_error_string(sqlite_last_error($db)));
        
        if ($row = $sth->fetch()) {
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
