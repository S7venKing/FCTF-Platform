using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ResourceShared.Models
{
    public class PerformanceStatistic
    {
        public required string MachineId { get; set; }
        /// <summary>
        /// Base Speed Of CPU
        /// </summary>
        public float? CpuBaseSpeed { get; set; }

        /// <summary>
        /// Model of CPU
        /// </summary>
        public string? CpuModel { get; set; }

        /// <summary>
        /// CPU Usage (%)
        /// </summary>
        public float? CpuUsage { get; set; }

        /// <summary>
        /// Total physical memory in gigabytes.
        /// </summary>
        public float? TotalMemory { get; set; }

        /// <summary>
        /// Free memory available in gigabytes.
        /// </summary>
        public float? FreeMemory { get; set; }

        /// <summary>
        /// Available memory for use in gigabytes.
        /// </summary>
        public float? AvailableMemory { get; set; }

        /// <summary>
        /// Used memory calculated as TotalMemory - FreeMemory in gigabytes.
        /// </summary>
        public float? UsedMemory { get; set; }

        /// <summary>
        /// Committed memory in gigabytes.
        /// </summary>
        public float? MemoryCached { get; set; }
    }
}
