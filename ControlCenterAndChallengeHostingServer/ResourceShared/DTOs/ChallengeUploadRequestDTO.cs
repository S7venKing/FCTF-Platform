using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ResourceShared.DTOs
{
    public class ChallengeUploadRequestDTO
    {
        /// <summary>
        /// ID of the Challenge.
        /// </summary>
        public required int ChallengeId { get; set; }

        /// <summary>
        /// Current time in Unix time format.
        /// </summary>
        public long UnixTime { get; set; }
    }
}
