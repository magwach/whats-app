"use client";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import React from "react";

function TaskPage() {
  const tasks = useQuery(api.task.getTasks);

  return (
    <div className="p-10 flex flex-col gap-4">
      <h1 className="text-5xl">All tasks are here in realtime</h1>
      {tasks?.map((task) => {
        return (
          <div key={task._id} className="flex gap-2">
            <span>{task.text}</span>
          </div>
        );
      })}
    </div>
  );
}

export default TaskPage;
