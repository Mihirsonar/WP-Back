export const USerRoleEnum={
    ADMIN : 'admin',
    PROJECT_ADMIN : 'project_admin',
    MEMBER : 'member',
}

export const AvailableRoles = Object.values(USerRoleEnum);

export const TaskStatusEnum = {
    TODO : 'todo',
    IN_PROGRESS : 'in_progress',
    DONE : 'done',
}

export const AvailableTaskStatus = Object.values(TaskStatusEnum);   

export const PriorityEnum ={
    High : "high",
    Medium : "medium",
    Low : "low"
}

export const Priority = Object.values(PriorityEnum);