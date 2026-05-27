// Tables
export { users, userRoleEnum } from './users';
export type { User, NewUser } from './users';

export { categories, assetTypes, assets } from './assets';
export type {
  Category,
  NewCategory,
  AssetType,
  NewAssetType,
  Asset,
  NewAsset,
} from './assets';

export { inspections, inspectionStatusEnum } from './inspections';
export type { Inspection, NewInspection, ChecklistItemResult } from './inspections';

export { checklistTemplates } from './checklists';
export type {
  ChecklistTemplate,
  NewChecklistTemplate,
  ChecklistTemplateItem,
} from './checklists';

export { vehicleServices } from './services';
export type { VehicleService, NewVehicleService } from './services';

export { notifications, notificationTypeEnum } from './notifications';
export type { Notification, NewNotification } from './notifications';

// Relations
export {
  usersRelations,
  categoriesRelations,
  assetTypesRelations,
  assetsRelations,
  inspectionsRelations,
  checklistTemplatesRelations,
  vehicleServicesRelations,
  notificationsRelations,
} from './relations';
