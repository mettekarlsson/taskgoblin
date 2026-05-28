package com.example.taskgoblin.mapper;

import com.example.taskgoblin.dto.TaskListDTO;
import com.example.taskgoblin.model.TaskList;

public class TaskListMapper {

    public static TaskListDTO mapToTaskListDTO(TaskList taskList) {
        return new TaskListDTO(
                taskList.getId(),
                taskList.getName(),
                taskList.getColor(),
                taskList.getIcon(),
                taskList.isPinned(),
                taskList.getDueAt()
        );
    }
}
