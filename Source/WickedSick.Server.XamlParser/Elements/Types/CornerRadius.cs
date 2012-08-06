﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace WickedSick.Server.XamlParser.Elements.Types
{
    public class CornerRadius : IJsonConvertible
    {
        public double Left { get; set; }
        public double Top { get; set; }
        public double Right { get; set; }
        public double Bottom { get; set; }

        public string ToJson(int tabIndents)
        {
            return string.Format("new CornerRadius({0}, {1}, {2}, {3})", Left, Top, Right, Bottom);
        }
    }
}
