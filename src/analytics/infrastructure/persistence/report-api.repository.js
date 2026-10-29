import { BaseApiRepository, toDateOnly } from '@/shared/infrastructure/base-api-repository.js'
import { Report } from '../../domain/model/entities/report.entity.js'

/** ReportApiRepository — infrastructure layer, Reporting & Analytics (/reports). */
export class ReportApiRepository extends BaseApiRepository {
  constructor() {
    super('/reports')
  }

  toEntity(resource) {
    return new Report({
      id: resource.id,
      ownerId: resource.ownerId,
      reportType: resource.reportType,
      generatedAt: resource.generatedDate,
      filterParams: resource.filterParams
    })
  }

  toResource(report) {
    return {
      ownerId: report.ownerId,
      reportType: report.reportType,
      from: toDateOnly(report.filterParams.from),
      to: toDateOnly(report.filterParams.to)
    }
  }
}
