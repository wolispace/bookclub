<?php

$c = $_REQUEST['c'] ?? '';
$data = $_REQUEST['d'] ?? '';
$back = $_REQUEST['b'] ?? date('Ymd');
$c = cleanString($c);

// unique code for js loading
$v = rand(10, 99999);

logIt(json_encode([$_REQUEST, $c]));

if (empty($c)) {
  outputPage($v);
} else {
  $club = getClub($c, $back);
  $club = filterEvents($club, $back);
  if (!empty($data)) {
    $club = saveClub($c, $club, $data);
  }
  outputJson($club);
}

function getClub($c) {
    return json_decode(file_get_contents("_${c}.json"), true);
}

function filterEvents($club, $back) {
  if (empty($back)) {
    return $club;
  }
  $filtered = [];
  foreach ($club['events'] as $key => $event) {
    if ($key >= $back) {
      $filtered[$key] = $event;
    }
  }
  $club['events'] = $filtered;
  return $club;
}


function saveClub($c, $club, $data) {
    $newData = json_decode($data, true);
    if (!empty($newData['clubname'])) {
      $club['name'] = $newData['clubname'];
      $club['code'] = $newData['code'];
      $club['members'] = array_map(function($name) { return ['name' => $name]; }, explode("\n", $newData['hosts'] ?? ''));
      $club['locations'] = explode("\n", $newData['locations'] ?? '');
    } elseif (!empty($newData['date'])) {
      // grab event values
      $key = toYmd($newData['date']);
      if ($newData['alt'] == 'DELETE') {
        unset($club['events'][$key]);
      } else {
        $thisEvent = $club['events'][$key];
        $newEvent = [];
        $newEvent['host'] = $newData['host'] ?? '';
        $newEvent['location'] = $newData['location'] ?? '';
        $newEvent['alt'] = $newData['alt'] ?? '';
        logIt("Saving event for {$key} with " . json_encode($newData));

        // scan for up to 3 books
        $foundBook = false;
        for ($i = 0; $i < 3; $i++) {
          if (!empty($newData["title-{$i}"])) {
            $foundBook = true;
            $newEvent['books'][] = [
              'title' => $newData["title-{$i}"],
              'by' => $newData["by-{$i}"],
              'url' => $newData["url-{$i}"],
            ];
          }
        }
        if (!$foundBook) {
          logIt("No book title provided, adding placeholder");
          $newEvent['books'][] = [
            'title' => 'Placeholder',
            'by' => '',
            'url' => '',
          ];
        }
        $club['events'][$key] = $newEvent;
      }
    }

    file_put_contents("_${c}.json", json_encode($club, JSON_PRETTY_PRINT));

    return $club;
}

function toYmd($str) {
    foreach (['d M Y', 'd/m/Y'] as $format) {
        $date = DateTime::createFromFormat($format, $str);
        if ($date) return $date->format('Ymd');
    }
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

    $clubList = 'Pick a club';
    $files = glob('_*.json');
    foreach($files as $file) {
        $clubData = json_decode(file_get_contents($file), true);
        $clubId = str_replace(['_', '.json'], '', $file);
        $clubList .= "<a href='?$clubId'>{$clubData['name']}</a>";
    }
    $clubList .= '<div class="button addbutton" onclick="addClub()">+ Add another club</div>';
    print "<!DOCTYPE html>
    <html dir='ltr' lang='en'>
    <head>
        <title>Bookclub</title>
        <meta charset='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0, interactive-widget=resizes-visual' />
        <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
            integrity='sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=='
            crossorigin='anonymous' referrerpolicy='no-referrer' />
        <link rel='icon' href='icon-192.png' type='image/png' />
        <link rel='stylesheet' href='bookclub.css?{$v}' />
        <script src='bookclub.js?{$v}' ></script>
        <link rel='manifest' href='manifest.json' />
        <script>navigator.serviceWorker?.register('sw.js');</script>
    </head>
    <body>
    <h1 class='clubtitle'>Bookclub</h1>
    <div class='schedule'>{$clubList}</div>
    <div class='overlay'></div>
    <div class='dialog'></div>
    </body>
    </html>";
}


