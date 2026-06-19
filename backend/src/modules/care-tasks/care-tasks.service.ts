import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CareTask, CareTaskStatus, CareTaskPriority, CareTaskType } from './entities/care-task.entity';
import { CreateCareTaskDto, UpdateCareTaskDto, ClaimTaskDto, CompleteTaskDto, FailTaskDto } from './dto/care-task.dto';

let idCounter = 100;

const generateId = () => {
  const timestamp = Date.now().toString(36);
  idCounter++;
  return `care-${timestamp}-${idCounter}`;
};

const initialTasks: CareTask[] = [
  {
    id: 'care-001',
    planId: 'plan-003',
    taskType: 'medication_reminder',
    taskName: '降压药提醒',
    description: '提醒王爷爷早餐后服用降压药',
    priority: 'high',
    status: 'pending',
    assigneeName: '李阿姨',
    assigneeRole: 'companion',
    deadline: '2024-06-20T09:00:00.000Z',
    creatorId: 'user-002',
    createdAt: '2024-06-18T10:00:00.000Z',
  },
  {
    id: 'care-002',
    planId: 'plan-003',
    taskType: 'water_supply',
    taskName: '饮水补给',
    description: '确保每位长者有充足的饮用水',
    priority: 'medium',
    status: 'assigned',
    assigneeName: '张叔叔',
    assigneeRole: 'companion',
    deadline: '2024-06-20T12:00:00.000Z',
    creatorId: 'user-002',
    createdAt: '2024-06-18T10:05:00.000Z',
    claimedAt: '2024-06-19T08:00:00.000Z',
  },
  {
    id: 'care-003',
    planId: 'plan-003',
    taskType: 'sun_protection',
    taskName: '遮阳帽准备',
    description: '为每位长者准备遮阳帽',
    priority: 'medium',
    status: 'completed',
    assigneeName: '王奶奶',
    assigneeRole: 'elder',
    deadline: '2024-06-20T08:00:00.000Z',
    creatorId: 'user-002',
    createdAt: '2024-06-18T10:10:00.000Z',
    claimedAt: '2024-06-19T07:30:00.000Z',
    completedAt: '2024-06-19T16:00:00.000Z',
  },
  {
    id: 'care-004',
    planId: 'plan-003',
    taskType: 'wheelchair_assist',
    taskName: '轮椅协助',
    description: '协助行动不便的刘爷爷使用轮椅',
    priority: 'critical',
    status: 'in_progress',
    assigneeName: '赵叔叔',
    assigneeRole: 'companion',
    deadline: '2024-06-20T18:00:00.000Z',
    creatorId: 'user-002',
    createdAt: '2024-06-18T10:15:00.000Z',
    claimedAt: '2024-06-19T09:00:00.000Z',
  },
  {
    id: 'care-005',
    planId: 'plan-003',
    taskType: 'emergency_contact',
    taskName: '紧急联系人确认',
    description: '确认每位长者的紧急联系人电话',
    priority: 'high',
    status: 'pending',
    assigneeName: '孙阿姨',
    assigneeRole: 'companion',
    deadline: '2024-06-19T18:00:00.000Z',
    creatorId: 'user-002',
    createdAt: '2024-06-18T10:20:00.000Z',
  },
  {
    id: 'care-006',
    planId: 'plan-006',
    taskType: 'meeting_point_check',
    taskName: '集合点点名',
    description: '早上8:00在朱家角古镇入口集合点名',
    priority: 'high',
    status: 'pending',
    assigneeName: '周叔叔',
    assigneeRole: 'companion',
    deadline: '2024-06-21T08:00:00.000Z',
    creatorId: 'user-003',
    createdAt: '2024-06-17T14:00:00.000Z',
  },
  {
    id: 'care-007',
    planId: 'plan-006',
    taskType: 'cane_assist',
    taskName: '手杖准备',
    description: '为需要手杖的长者准备好手杖',
    priority: 'medium',
    status: 'failed',
    assigneeName: '吴奶奶',
    assigneeRole: 'elder',
    deadline: '2024-06-20T18:00:00.000Z',
    creatorId: 'user-003',
    createdAt: '2024-06-17T14:05:00.000Z',
    failureReason: '家中手杖找不到了，需要购买新的',
  },
  {
    id: 'care-008',
    planId: 'plan-006',
    taskType: 'cold_protection',
    taskName: '保暖衣物提醒',
    description: '提醒长者携带保暖外套，古镇风大',
    priority: 'low',
    status: 'completed',
    assigneeName: '郑阿姨',
    assigneeRole: 'companion',
    deadline: '2024-06-21T07:00:00.000Z',
    creatorId: 'user-003',
    createdAt: '2024-06-17T14:10:00.000Z',
    claimedAt: '2024-06-18T10:00:00.000Z',
    completedAt: '2024-06-20T20:00:00.000Z',
  },
];

@Injectable()
export class CareTasksService {
  private tasks: CareTask[] = [...initialTasks];

  findAll(params?: {
    planId?: string;
    priority?: CareTaskPriority;
    status?: CareTaskStatus;
  }): CareTask[] {
    let result = [...this.tasks];
    if (params?.planId) {
      result = result.filter((t) => t.planId === params.planId);
    }
    if (params?.priority) {
      result = result.filter((t) => t.priority === params.priority);
    }
    if (params?.status) {
      result = result.filter((t) => t.status === params.status);
    }
    return result.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  findOne(id: string): CareTask {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new NotFoundException(`照护任务 ${id} 不存在`);
    return task;
  }

  findByPlanId(planId: string): CareTask[] {
    return this.tasks.filter((t) => t.planId === planId);
  }

  create(dto: CreateCareTaskDto): CareTask {
    const task: CareTask = {
      id: generateId(),
      planId: dto.planId,
      taskType: dto.taskType,
      taskName: dto.taskName,
      description: dto.description || '',
      priority: dto.priority,
      status: 'pending',
      assigneeName: dto.assigneeName,
      assigneeRole: dto.assigneeRole,
      deadline: dto.deadline,
      creatorId: dto.creatorId,
      createdAt: new Date().toISOString(),
      remark: dto.remark,
    };
    this.tasks.push(task);
    return task;
  }

  update(id: string, dto: UpdateCareTaskDto): CareTask {
    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new NotFoundException(`照护任务 ${id} 不存在`);
    const current = this.tasks[idx];
    if (current.status === 'completed' || current.status === 'failed') {
      throw new BadRequestException('已完成或未完成的任务不能修改');
    }
    this.tasks[idx] = { ...current, ...dto };
    return this.tasks[idx];
  }

  remove(id: string): boolean {
    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new NotFoundException(`照护任务 ${id} 不存在`);
    this.tasks.splice(idx, 1);
    return true;
  }

  claimTask(id: string, dto: ClaimTaskDto): CareTask {
    const task = this.findOne(id);
    if (task.status !== 'pending') {
      throw new BadRequestException('只有待分配的任务可以领取');
    }
    task.status = 'assigned';
    task.assigneeName = dto.claimantName;
    task.assigneeRole = dto.claimantRole;
    task.claimedAt = new Date().toISOString();
    return task;
  }

  startTask(id: string): CareTask {
    const task = this.findOne(id);
    if (task.status !== 'assigned') {
      throw new BadRequestException('只有已分配的任务可以开始执行');
    }
    task.status = 'in_progress';
    return task;
  }

  completeTask(id: string, dto: CompleteTaskDto): CareTask {
    const task = this.findOne(id);
    if (task.status !== 'in_progress' && task.status !== 'assigned') {
      throw new BadRequestException('只有进行中或已分配的任务可以标记完成');
    }
    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    if (dto.remark) {
      task.remark = dto.remark;
    }
    return task;
  }

  failTask(id: string, dto: FailTaskDto): CareTask {
    const task = this.findOne(id);
    if (task.status === 'completed' || task.status === 'failed') {
      throw new BadRequestException('该任务状态无法标记为未完成');
    }
    task.status = 'failed';
    task.failureReason = dto.failureReason;
    task.completedAt = new Date().toISOString();
    return task;
  }

  getStats(planId?: string) {
    const tasks = planId ? this.tasks.filter((t) => t.planId === planId) : this.tasks;
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const pending = tasks.filter((t) => t.status === 'pending').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const failed = tasks.filter((t) => t.status === 'failed').length;
    const assigned = tasks.filter((t) => t.status === 'assigned').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const now = new Date();
    const overdue = tasks.filter((t) => {
      if (t.status === 'completed') return false;
      const deadline = new Date(t.deadline);
      return deadline < now;
    }).length;

    const failureReasons: { reason: string; count: number }[] = [];
    const reasonMap: Record<string, number> = {};
    tasks.filter((t) => t.failureReason).forEach((t) => {
      const reason = t.failureReason!;
      reasonMap[reason] = (reasonMap[reason] || 0) + 1;
    });
    Object.entries(reasonMap)
      .sort((a, b) => b[1] - a[1])
      .forEach(([reason, count]) => {
        failureReasons.push({ reason, count });
      });

    const priorityDistribution: { priority: CareTaskPriority; count: number; completed: number }[] = [];
    const priorities: CareTaskPriority[] = ['critical', 'high', 'medium', 'low'];
    priorities.forEach((p) => {
      const pTasks = tasks.filter((t) => t.priority === p);
      priorityDistribution.push({
        priority: p,
        count: pTasks.length,
        completed: pTasks.filter((t) => t.status === 'completed').length,
      });
    });

    return {
      total,
      completed,
      pending,
      inProgress,
      failed,
      assigned,
      completionRate,
      overdue,
      failureReasons,
      priorityDistribution,
    };
  }

  getPlanBurden() {
    const planMap: Record<string, { planId: string; planTitle: string; taskCount: number; criticalCount: number; highCount: number }> = {};
    this.tasks.forEach((t) => {
      if (!planMap[t.planId]) {
        planMap[t.planId] = {
          planId: t.planId,
          planTitle: '',
          taskCount: 0,
          criticalCount: 0,
          highCount: 0,
        };
      }
      planMap[t.planId].taskCount++;
      if (t.priority === 'critical') planMap[t.planId].criticalCount++;
      if (t.priority === 'high') planMap[t.planId].highCount++;
    });
    return Object.values(planMap).sort((a, b) => b.taskCount - a.taskCount);
  }
}
