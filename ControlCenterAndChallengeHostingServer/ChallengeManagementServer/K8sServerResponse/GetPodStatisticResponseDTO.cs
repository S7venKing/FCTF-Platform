namespace ChallengeManagementServer.K8sServerResponse.GetPodStatisticResponseDTO
{
    public class GetPodStatisticResponseDTO
    {
        public string Kind { get; set; } = string.Empty;
        public string ApiVersion { get; set; } = string.Empty;
        public Metadata Metadata { get; set; } = new Metadata();
        public DateTime Timestamp { get; set; }
        public string Window { get; set; } = string.Empty;
        public List<Container> Containers { get; set; } = new List<Container>();
    }

    public class Metadata
    {
        public string Name { get; set; } = string.Empty;
        public string _Namespace { get; set; } = string.Empty;
        public DateTime CreationTimestamp { get; set; }
        public Labels Labels { get; set; } = new Labels();
    }

    public class Labels
    {
        public string App { get; set; } = string.Empty;
        public string Podtemplatehash { get; set; } = string.Empty;
    }

    public class Container
    {
        public string Name { get; set; } = string.Empty;
        public Usage Usage { get; set; } = new Usage();
    }

    public class Usage
    {
        public string Cpu { get; set; } = string.Empty;
        public string Memory { get; set; } = string.Empty;
    }
}
