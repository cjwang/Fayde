/// <reference path="../../Runtime/Nullstone.ts" />
/// CODE
/// <reference path="../../Primitives/rect.ts" />
/// <reference path="../../Core/UIElement.ts" />
/// <reference path="../ScrollViewer.ts" />

module Fayde.Controls.Primitives {
    export interface IScrollInfo {
        ScrollOwner: ScrollViewer;

        LineUp();
        LineDown();
        LineLeft();
        LineRight();

        MouseWheelUp();
        MouseWheelDown();
        MouseWheelLeft();
        MouseWheelRight();

        PageUp();
        PageDown();
        PageLeft();
        PageRight();

        MakeVisible(uie: UIElement, rectangle: rect): rect;

        SetHorizontalOffset(offset: number);
        SetVerticalOffset(offset: number);

        CanHorizontallyScroll: bool;
        CanVerticallyScroll: bool;
        ExtentHeight: number;
        ExtentWidth: number;
        HorizontalOffset: number;
        VerticalOffset: number;
        ViewportHeight: number;
        ViewportWidth: number;
    }
    export var IScrollInfo_ = Nullstone.RegisterInterface("IScrollInfo");
}