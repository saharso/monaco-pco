import React from 'react';
import './App.scss';
import CodeEditor from "./components/Monaco/Monaco";

const valueMock = "SET partition_date = UNIX_EPOCH_TO_DATE(time);\n" +
        "SET NewNew = headers.head.index + 1;\n" +
        "// GENERATED @ 2021-09-19T13:01:34.562686Z\n" +
        "// GENERATED @ 2021-09-19T13:01:55.560447Z\n" +
        "// GENERATED @ 2021-09-19T13:02:56.563311Z\n" +
        "SELECT PARTITION_TIME(partition_date) AS partition_date,\n" +
        "       AGGREGATION_TIME() AS processing_time:TIMESTAMP,\n" +
        "       data.dropoff_datetime AS dropoff_datetime,\n" +
        "       data.extra AS extra,\n" +
        "       NewNew AS newnew:DOUBLE,\n" +
        "  FROM \"NY Taxi Rides\" LEFT JOIN \"key to shard target\" testtest ON testtest.key = data.payment_type \n" +
        "    GROUP BY NewNew,\n" +
        "          PARTITION_TIME(partition_date),\n" +
        "          data.dropoff_datetime,\n" +
        "          data.extra\n" +
        "    APPEND ON DUPLICATE\n" +
        "-- read more about export job in the documentation button >> (?)\n";

function App() {
  return (
    <div className="App">
      <CodeEditor
        value={valueMock}
      />
    </div>
  );
}

export default App;
