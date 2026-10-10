import { Doctor } from '../models/Doctor.js';
import { Patient } from '../models/Patient.js';

export interface DashboardAnalyticsResponse {
  kpis: {
    totalDoctors: number;
    totalPatients: number;
    activePatients: number;
    criticalPatients: number;
    avgPatientsPerDoctor: number;
  };
  patientsPerDoctor: Array<{
    doctorId: string;
    doctorName: string;
    specialization: string;
    hospital: string;
    patientCount: number;
  }>;
  admissionsOverTime: Array<{
    date: string;
    admissions: number;
  }>;
  conditionBreakdown: Array<{
    condition: string;
    count: number;
    percentage: number;
  }>;
  allConditions?: Array<{
    condition: string;
    count: number;
    percentage: number;
  }>;
  statusBreakdown: Array<{
    status: string;
    count: number;
  }>;
}

export const getDashboardAnalytics = async (): Promise<DashboardAnalyticsResponse> => {
  const [totalDoctors, totalPatients, patientFacetResults] = await Promise.all([
    Doctor.countDocuments(),
    Patient.countDocuments(),
    Patient.aggregate([
      {
        $facet: {
          statusCounts: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              },
            },
          ],

          doctorLoad: [
            {
              $group: {
                _id: '$doctor',
                patientCount: { $sum: 1 },
              },
            },
            {
              $lookup: {
                from: 'doctors',
                localField: '_id',
                foreignField: '_id',
                as: 'doctorInfo',
              },
            },
            { $unwind: '$doctorInfo' },
            { $sort: { patientCount: -1 } },
            { $limit: 8 },
            {
              $project: {
                _id: 0,
                doctorId: '$_id',
                doctorName: '$doctorInfo.name',
                specialization: '$doctorInfo.specialization',
                hospital: '$doctorInfo.hospital',
                patientCount: 1,
              },
            },
          ],

          admissionsTrend: [
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m', date: '$admissionDate' },
                },
                admissions: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
            {
              $project: {
                _id: 0,
                date: '$_id',
                admissions: 1,
              },
            },
          ],

          conditionDistribution: [
            {
              $group: {
                _id: '$condition',
                count: { $sum: 1 },
                latestAdmission: { $max: '$admissionDate' },
              },
            },
            { $sort: { count: -1, latestAdmission: -1, _id: 1 } },
            {
              $project: {
                _id: 0,
                condition: '$_id',
                count: 1,
              },
            },
          ],
        },
      },
    ]),
  ]);

  const facets = patientFacetResults[0] || {
    statusCounts: [],
    doctorLoad: [],
    admissionsTrend: [],
    conditionDistribution: [],
  };

  let activePatients = 0;
  let criticalPatients = 0;
  const statusBreakdown = (facets.statusCounts || []).map((s: { _id: string; count: number }) => {
    if (s._id === 'Active') activePatients = s.count;
    if (s._id === 'Critical') criticalPatients = s.count;
    return {
      status: s._id,
      count: s.count,
    };
  });

  const avgPatientsPerDoctor =
    totalDoctors > 0 ? Number((totalPatients / totalDoctors).toFixed(1)) : 0;

  const rawConditions: Array<{ condition: string; count: number }> =
    facets.conditionDistribution || [];

  const allConditions = rawConditions.map((c) => ({
    condition: c.condition,
    count: c.count,
    percentage: totalPatients > 0 ? Number(((c.count / totalPatients) * 100).toFixed(1)) : 0,
  }));

  let conditionBreakdown: Array<{ condition: string; count: number; percentage: number }> = [];

  if (rawConditions.length <= 6) {
    conditionBreakdown = allConditions;
  } else {
    const top5 = rawConditions.slice(0, 5).map((c) => ({
      condition: c.condition,
      count: c.count,
      percentage: totalPatients > 0 ? Number(((c.count / totalPatients) * 100).toFixed(1)) : 0,
    }));

    const otherTotal = rawConditions.slice(5).reduce((sum, c) => sum + c.count, 0);

    const otherPercentage =
      totalPatients > 0 ? Number(((otherTotal / totalPatients) * 100).toFixed(1)) : 0;

    conditionBreakdown = [
      ...top5,
      {
        condition: `Other (${rawConditions.length - 5} diagnoses)`,
        count: otherTotal,
        percentage: otherPercentage,
      },
    ];
  }

  return {
    kpis: {
      totalDoctors,
      totalPatients,
      activePatients,
      criticalPatients,
      avgPatientsPerDoctor,
    },
    patientsPerDoctor: facets.doctorLoad || [],
    admissionsOverTime: facets.admissionsTrend || [],
    conditionBreakdown,
    statusBreakdown,
  };
};
