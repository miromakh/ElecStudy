//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Electronics.Models
{
    using System;
    
    public partial class Article
    {
        public int ID { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string MainText { get; set; }
        public string FilePath { get; set; }
        public System.DateTime CreationTime { get; set; }
        public Nullable<System.DateTime> ModificationTime { get; set; }
        public bool IsImageOnly { get; set; }
        public bool IsTextOnly { get; set; }
    }
}
