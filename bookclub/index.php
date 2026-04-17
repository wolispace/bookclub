<?php

$c = $_REQUEST['c'] ?? '';
$data = $_REQUEST['d'] ?? '';
$c = cleanString($c);

// unique code for js loading
$v = rand(10, 99999);

logIt(json_encode([$_REQUEST, $c]));

if (empty($c)) {
  outputPage($v);
} else {
  $club = getClub($c);
  if (!empty($data)) {
    $club = saveClub($c, $club, $data);
  }
  outputJson($club);
}

function getClub($c) {
    return json_decode(file_get_contents("_${c}.json"));
}

function saveClub($c, $club, $data) {
    $newData = json_decode($data);
    foreach ($newData as $key => $value) {
        logIt("Setting {$key} to {$value}");
        if ($key == 'clubname') {
            $club->name = $value;
        }
        //$club->$key = $value;
    }

    file_put_contents("_${c}.json", json_encode($club, JSON_PRETTY_PRINT));

    return $club;
}

function logIt($str) {
  $dateTime = date('Ymd H:i:s');
  file_put_contents('_log.txt', "{$dateTime},{$_SERVER['REMOTE_ADDR']},{$str}\n", FILE_APPEND | LOCK_EX);
}

function cleanString($str) {
  $str = preg_replace('/[^a-z0-9]/i', '', $str);

  return substr($str, 0, 15);
}

function outputJson($data) {
    header('Content-Type: application/json');
    echo json_encode($data);
}

function outputPage($v) {
    print "<!DOCTYPE html>
    <html dir='ltr' lang='en'>
    <head>
        <title>Bookclub</title>
        <meta charset='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0, interactive-widget=resizes-visual' />
        <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
            integrity='sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=='
            crossorigin='anonymous' referrerpolicy='no-referrer' />
        <link rel='stylesheet' href='bookclub.css?{$v}' />
        <script src='bookclub.js?{$v}' ></script>
    </head>
    <body>
    <h1 class='clubtitle'>Bookclub</h1>
    <div class='schedule'></div>
    <div class='dialog'></div>
    </body>
    </html>";
}


