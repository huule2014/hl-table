<?php
$data = json_decode(file_get_contents("php://input"));

if (isset($data->firstLoad)) {
    $data->firstLoad = false;
}
$offset = isset($data->offset) ? $data->offset : 0;

$arr = array();
$totalRows = 100;

foreach (range(1, $offset) as $i) {
    array_push($arr, array(
        "id" => $i,
        "name" => "Item " . $i,
        "published" => rand(0, 1)
    ));
}

sleep(1);

echo json_encode(array("dataList" => $arr, "totalRows" => $totalRows, "paramSession" => $data));