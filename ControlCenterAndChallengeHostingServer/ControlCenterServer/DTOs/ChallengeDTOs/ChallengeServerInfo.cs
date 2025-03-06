using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ControlCenterServer.DTOs.ChallengeDTOs
{
    public class ChallengeServerInfo
    {
        /// <summary>
        /// ID of the Host Machine.
        /// </summary>
        public required string ServerId { get; set; }

        public required string ServerName { get; set; }

        public required string ServerHost { get; set; }

        public required int ServerPort { get; set; }
    }
}
