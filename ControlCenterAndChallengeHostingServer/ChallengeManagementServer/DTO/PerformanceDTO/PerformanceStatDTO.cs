namespace ChallengeManagementServer.DTO.PerformanceStatDTO
{
    public class PerformanceStatDTO
    {
        public string? ServerId { get; set; }
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

    public class CpuUsageDTO
    {
        /// <summary>
        /// Base Speed Of CPU
        /// </summary>
        public float? BaseSpeed { get; set; }

        /// <summary>
        /// Model of CPU
        /// </summary>
        public string? Model { get; set; }

        /// <summary>
        /// CPU Usage (%)
        /// </summary>
        public float? CpuUsage { get; set; }
    }

    /// <summary>
    /// Represents memory statistics of the system.
    /// </summary>
    public class MemoryStatsDTO
    {
        /// <summary>
        /// Total physical memory in gigabytes.
        /// </summary>
        public float TotalMemory { get; set; }

        /// <summary>
        /// Free memory available in gigabytes.
        /// </summary>
        public float FreeMemory { get; set; }

        /// <summary>
        /// Available memory for use in gigabytes.
        /// </summary>
        public float AvailableMemory { get; set; }

        /// <summary>
        /// Used memory calculated as TotalMemory - FreeMemory in gigabytes.
        /// </summary>
        public float UsedMemory { get; set; }

        /// <summary>
        /// Committed memory in gigabytes.
        /// </summary>
        public float Cached { get; set; }
    }
}