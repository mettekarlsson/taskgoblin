package com.example.taskgoblin.mapper;

import com.example.taskgoblin.dto.CreateTaskDTO;
import com.example.taskgoblin.dto.TaskDTO;
import com.example.taskgoblin.dto.UpdateTaskDTO;
import com.example.taskgoblin.model.Category;
import com.example.taskgoblin.model.Task;
import com.example.taskgoblin.model.TaskList;

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
                task.getLastCompletedAt(),

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

    /*
 Updates an existing task entity with values from UpdateTaskDTO.

 The mapper is only responsible for transferring data.
 Validation and business rules belong in the service layer.
*/
    public static void updateEntity(
            Task task,
            UpdateTaskDTO updateTaskDTO,
            Category category,
            TaskList taskList
    ) {

        task.setTitle(updateTaskDTO.getTitle());
        task.setDueAt(updateTaskDTO.getDueAt());
        task.setPriority(updateTaskDTO.getPriority());

        task.setRecurring(Boolean.TRUE.equals(updateTaskDTO.getIsRecurring()));

        task.setFrequency(updateTaskDTO.getFrequency());

        task.setIntervalValue(updateTaskDTO.getIntervalValue());

        task.setSortOrder(updateTaskDTO.getSortOrder());

        task.setCategory(category);

        task.setList(taskList);
    }
}
