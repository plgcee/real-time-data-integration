import RecordList from "@/components/RecordList";
import CreateSchemaForm from "@/components/CreateSchemaForm";

export default function Home() {
  return (
    <div className="container-sm">
      <h1 className="text-center text-3xl m-3">Real Time Data Integration & Replication</h1>
        <CreateSchemaForm/>
        <RecordList />
    </div>
  );
}
