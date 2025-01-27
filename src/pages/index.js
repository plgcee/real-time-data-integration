import RecordList from "@/components/RecordList";
import CreateSchemaForm from "@/components/CreateSchemaForm";
import CreateDatabaseForm from "@/components/CreateDatabaseForm";
import InsertRecordsForm from "@/components/InsertRecordsForm";

export default function Home() {
  return (
    <div className="container-sm">
      <h1 className="text-center text-3xl m-3">Real Time Data Integration & Replication</h1>
      <div className="flex">
        <div className="flex-1"><CreateDatabaseForm/></div>
        <div className="flex-2"><CreateSchemaForm/></div>
      </div>
        <InsertRecordsForm/>
        <RecordList />
    </div>
  );
}
