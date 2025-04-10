import RecordList from "@/components/RecordList";
import CreateSchemaForm from "@/components/CreateSchemaForm";
import CreateDatabaseForm from "@/components/CreateDatabaseForm";
import InsertRecordsForm from "@/components/InsertRecordsForm";

export default function Home() {
  return (
    <div className="container-sm">
<h1 className="text-center text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 drop-shadow-lg m-4">
  Real-Time Data Integration & Replication</h1>      
<div className="flex">
        <div className="flex-1"><CreateDatabaseForm/></div>
        <div className="flex-2"><CreateSchemaForm/></div>
      </div>
        <InsertRecordsForm/>
        <RecordList />
    </div>
  );
}
