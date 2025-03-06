namespace ChallengeManagementServer.K8sServerResponse.GetClusterStatisticResponseDTO
{
    public class ClusterStatisticResponseInfo
    {
        public Node Node { get; set; } = new Node();

        public List<Pod> Pods { get; set; } = new List<Pod>();
    }

    public class Node
    {
        public string NodeName { get; set; } = string.Empty;
        public List<Systemcontainer> SystemContainers { get; set; } = new List<Systemcontainer>();
        public DateTime StartTime { get; set; }
        public Cpu Cpu { get; set; } = new Cpu();
        public Memory Memory { get; set; } = new Memory();
        public Network Network { get; set; } = new Network();
        public Fs fs { get; set; } = new Fs();
        public Runtime Runtime { get; set; } = new Runtime();
        public Rlimit rlimit { get; set; } = new Rlimit();
    }

    public class Cpu
    {
        public DateTime Time { get; set; }
        public long UsageNanoCores { get; set; }
        public long UsageCoreNanoSeconds { get; set; }
    }

    public class Memory
    {
        public DateTime time { get; set; }
        public long AvailableBytes { get; set; }
        public long UsageBytes { get; set; }
        public long WorkingSetBytes { get; set; }
        public long RssBytes { get; set; }
        public long PageFaults { get; set; }
        public long MajorPageFaults { get; set; }
    }

    public class Network
    {
        public DateTime Time { get; set; }
        public string Name { get; set; } = string.Empty;
        public long RxBytes { get; set; }
        public long RxErrors { get; set; }
        public long TxBytes { get; set; }
        public long TxErrors { get; set; }
        public List<Interface> Interfaces { get; set; } = new List<Interface> { };
    }

    public class Interface
    {
        public string Name { get; set; } = string.Empty;
        public long RxBytes { get; set; }
        public long RxErrors { get; set; }
        public long TxBytes { get; set; }
        public long TxErrors { get; set; }
    }

    public class Fs
    {
        public DateTime Time { get; set; }
        public long AvailableBytes { get; set; }
        public long CapacityBytes { get; set; }
        public long UsedBytes { get; set; }
        public long InodesFree { get; set; }
        public long Inodes { get; set; }
        public long InodesUsed { get; set; }
    }

    public class Runtime
    {
        public Imagefs ImageFs { get; set; } = new Imagefs();
    }

    public class Imagefs
    {
        public DateTime Time { get; set; }
        public long AvailableBytes { get; set; }
        public long CapacityBytes { get; set; }
        public long UsedBytes { get; set; }
        public long InodesFree { get; set; }
        public long Inodes { get; set; }
        public long InodesUsed { get; set; }
    }

    public class Rlimit
    {
        public DateTime Time { get; set; }
        public long Maxpid { get; set; }
        public long Curproc { get; set; }
    }

    public class Systemcontainer
    {
        public string Name { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public Cpu Cpu { get; set; } = new Cpu();
        public Memory Memory { get; set; } = new Memory();
    }

    public class Pod
    {
        public Podref PodRef { get; set; } = new Podref();
        public DateTime StartTime { get; set; } = new DateTime();
        public List<Container> Containers { get; set; } = new List<Container>();
        public Cpu Cpu { get; set; } = new Cpu();
        public Memory Memory { get; set; } = new Memory();
        public List<Volume> Volume { get; set; } = new List<Volume>();
        public EphemeralStorage Ephemeralstorage { get; set; } = new EphemeralStorage();
        public Process_Stats process_stats { get; set; } = new Process_Stats();
    }

    public class Podref
    {
        public string Name { get; set; } = string.Empty;
        public string Namespace { get; set; } = string.Empty;
        public string Uid { get; set; } = string.Empty;
    }
    public class EphemeralStorage
    {
        public DateTime Time { get; set; }
        public long AvailableBytes { get; set; }
        public long CapacityBytes { get; set; }
        public long UsedBytes { get; set; }
        public long InodesFree { get; set; }
        public long Inodes { get; set; }
        public long InodesUsed { get; set; }
    }

    public class Process_Stats
    {
        public long Process_count { get; set; }
    }

    public class Container
    {
        public string Name { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public Cpu Cpu { get; set; } = new Cpu();
        public Memory Memory { get; set; } = new Memory();
        public Rootfs Rootfs { get; set; } = new Rootfs();
        public Logs Logs { get; set; } = new Logs();
    }

    public class Rootfs
    {
        public DateTime Time { get; set; }
        public long AvailableBytes { get; set; }
        public long CapacityBytes { get; set; }
        public long UsedBytes { get; set; }
        public long InodesFree { get; set; }
        public long Inodes { get; set; }
        public long InodesUsed { get; set; }
    }

    public class Logs
    {
        public DateTime Time { get; set; }
        public long AvailableBytes { get; set; }
        public long CapacityBytes { get; set; }
        public long UsedBytes { get; set; }
        public long InodesFree { get; set; }
        public long Inodes { get; set; }
        public long InodesUsed { get; set; }
    }

    public class Volume
    {
        public DateTime Time { get; set; }
        public long AvailableBytes { get; set; }
        public long CapacityBytes { get; set; }
        public long UsedBytes { get; set; }
        public long InodesFree { get; set; }
        public long Inodes { get; set; }
        public long InodesUsed { get; set; }
        public string Name { get; set; } = string.Empty;
    }



}
