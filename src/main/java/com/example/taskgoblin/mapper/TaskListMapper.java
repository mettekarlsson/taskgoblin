package com.example.taskgoblin.mapper;

import com.example.taskgoblin.dto.CreateTaskListDTO;
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


    public static TaskList mapToTaskList(CreateTaskListDTO dto) {
        TaskList taskList = new TaskList();

        taskList.setName(dto.getName());
        taskList.setColor(dto.getColor());
        taskList.setIcon(dto.getIcon());
        taskList.setPinned(
                dto.getPinned() != null ? dto.getPinned() : false
        );
        taskList.setDueAt(dto.getDueAt());

        return taskList;
    }
}
