namespace ResourceShared.Models
{
    public class ClusterStatisticInfo
    {
        // By %
        public double CpuUsage { get; set; } 

        // By Mi
        public double RamAvailable { get; set; } 

        // By Mi
        public double RamTotal { get; set; }

        public string ServerId { get; set; } = string.Empty ;

    }

    public class ClusterUsageByPercent
    {
        // By %
        public double CpuUsage { get; set; }

        // By Mi
        public double RamUsage { get; set; }

        public string ServerId { get; set; } = string.Empty;

    }

    
    public class PodStatisticInfo
    {
        public string PodName { get; set; } = string.Empty;
        public required int ChallengeId { get; set; }

        public required int TeamId { get; set; }

        //public List<Container> Containers { get; set; } = new List<Container>();

        public double CpuUsage { get; set; }

        public double RAMUsage { get; set; }

        public string ServerId { get; set; } = string.Empty;
    }

    public class EstimationInfo
    {
        public List<PodStatisticInfo> TopCPUUsage { get; set; } = new List<PodStatisticInfo>();

        public List<PodStatisticInfo> TopRAMUsage { get; set; } = new List<PodStatisticInfo>();

        public double MinRAMUsageNeed { get; set; }
        public double MinCPUUsageNeed { get; set; }

        public double RecommendRAMUsageNeed { get; set; }
        public double RecommendCPUUsageNeed { get; set; }
    }
}