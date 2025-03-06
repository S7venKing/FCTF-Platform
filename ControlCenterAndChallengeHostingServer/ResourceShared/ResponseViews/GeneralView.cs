using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ResourceShared.ResponseViews
{
    public class GeneralView
    {
        public required string Message { get; set; }
        public bool IsSuccess { get; set; }
    }

    public class GenaralViewResponseData<T> : GeneralView
    {
        public T? data { get; set; }
    }

}
