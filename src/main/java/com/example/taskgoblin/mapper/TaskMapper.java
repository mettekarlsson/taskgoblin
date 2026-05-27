package com.example.taskgoblin.mapper;

import com.example.taskgoblin.dto.CreateTaskDTO;
import com.example.taskgoblin.dto.TaskDTO;
import com.example.taskgoblin.model.Task;

public class TaskMapper {

    /*
     Maps a Task entity to a TaskDTO.

     Used when sending task data back to the client.
    */
    public static TaskDTO mapToTaskDto(Task task) {

        return new TaskDTO(
                task.getId(),
                task.getTitle(),
                task.getDueAt(),
                task.getPriority(),
                task.getStatus(),
                task.isRecurring(),
                task.getCreatedAt(),
                task.getUpdatedAt(),
                task.getCompletedAt(),

                task.getList() != null ? task.getList().getId() : null,

                task.getCategory() != null ? task.getCategory().getId() : null,

                task.getFrequency(),

                task.getIntervalValue()
        );
    }

    /*
     Maps incoming CreateTaskDTO data into a Task entity.

     Only fields that the client is allowed to set
     should be mapped here.
    */
    public static Task mapToTaskEntity(CreateTaskDTO createTaskDTO) {

        Task task = new Task();

        task.setTitle(createTaskDTO.getTitle());
        task.setDueAt(createTaskDTO.getDueAt());
        task.setPriority(createTaskDTO.getPriority());
        task.setRecurring(Boolean.TRUE.equals(createTaskDTO.getIsRecurring()));

        task.setFrequency(createTaskDTO.getFrequency());

        task.setIntervalValue(createTaskDTO.getIntervalValue());

        return task;
    }
}
