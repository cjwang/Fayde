module Fayde.Controls.Internal {
    import NotifyCollectionChangedEventArgs = Collections.NotifyCollectionChangedEventArgs;
    import NotifyCollectionChangedAction = Collections.NotifyCollectionChangedAction;
    import INotifyCollectionChanged_ = Collections.INotifyCollectionChanged_;

    export interface IItemContainersOwner {
        PrepareContainerForItem(container: UIElement, item: any);
        ClearContainerForItem(container: UIElement, item: any);
        GetContainerForItem(): UIElement;
        IsItemItsOwnContainer(item: any): boolean;
    }
    export interface IItemContainersManager {
        IsRecycling: boolean;
        
        IndexFromContainer(container: UIElement): number;
        ContainerFromIndex(index: number): UIElement;
        ItemFromContainer(container: UIElement): any;
        ContainerFromItem(item: any): UIElement;
        
        OnItemsAdded(index: number, items: any[]);
        OnItemsRemoved(index: number, items: any[]);
        DisposeContainers(index?: number, count?: number);

        CreateGenerator(index: number, count: number): IContainerGenerator;
        GetEnumerator(index?: number, count?: number): IContainerEnumerator;
    }
    export class ItemContainersManager implements IItemContainersManager {
        private _Items: any[] = [];
        private _Containers: UIElement[] = [];
        private _Cache: UIElement[] = [];
        
        IsRecycling = false;

        constructor(public Owner: IItemContainersOwner) { }

        IndexFromContainer(container: UIElement): number { return this._Containers.indexOf(container); }
        ContainerFromIndex(index: number): UIElement { return this._Containers[index]; }
        ItemFromContainer(container: UIElement): any {
            var index = this._Containers.indexOf(container);
            if (index < 0)
                return null;
            return this._Items[index];
        }
        ContainerFromItem(item: any): UIElement {
            if (item == null)
                return null;
            var index = this._Items.indexOf(item);
            if (index < 0)
                return null;
            return this._Containers[index];
        }

        OnItemsAdded(index: number, items: any[]) {
            var args = items.slice(0);
            args.unshift(index, 0);
            this._Items.splice.apply(this._Items, args);

            var containers = this._Containers;
            for (var i = 0, len = items.length; i < len; i++) {
                containers.splice(index + i, 0, null);
            }
        }
        OnItemsRemoved(index: number, items: any[]) {
            this.DisposeContainers(index, items.length);
            this._Items.splice(index, items.length);
            this._Containers.splice(index, items.length);
        }
        DisposeContainers(index?: number, count?: number) {
            var containers = this._Containers;
            var items = this._Items;
            if (index == null) index = 0;
            if (count == null) count = containers.length;

            if (this.IsRecycling)
                this._Cache.push.apply(this._Cache, containers.slice(index, index + count));

            var ic = this.Owner;
            for (var i = index; i < index + count; i++) {
                var container = containers[i];
                if (!container)
                    continue;
                var item = items[i];
                ic.ClearContainerForItem(container, item);
                containers[i] = null;
            }
        }

        CreateGenerator(index: number, count: number): IContainerGenerator {
            var generator: IContainerGenerator = {
                IsCurrentNew: false,
                Current: undefined,
                CurrentItem: undefined,
                CurrentIndex: index - 1,
                GenerateIndex: -1,
                Generate: function (): boolean { return false; }
            };

            var ic = this.Owner;
            var icm = this;
            var containers = this._Containers;
            var items = this._Items;
            var cache = this._Cache;
            generator.Generate = function (): boolean {
                generator.GenerateIndex++;
                generator.CurrentIndex++;
                generator.IsCurrentNew = false;
                if (generator.CurrentIndex < 0 || generator.GenerateIndex >= count || generator.CurrentIndex >= containers.length) {
                    generator.Current = undefined;
                    generator.CurrentItem = undefined;
                    return false;
                }
                generator.CurrentItem = items[generator.CurrentIndex];
                if ((generator.Current = containers[generator.CurrentIndex]) == null) {
                    if (ic.IsItemItsOwnContainer(generator.CurrentItem)) {
                        if (generator.CurrentItem instanceof UIElement)
                            generator.Current = <UIElement>generator.CurrentItem;
                        generator.IsCurrentNew = true;
                    } else if (cache.length > 0) {
                        generator.Current = cache.pop();
                    } else {
                        generator.Current = ic.GetContainerForItem();
                        generator.IsCurrentNew = true;
                    }
                    containers[generator.CurrentIndex] = generator.Current;
                }

                return true;
            };

            return generator;
        }
        GetEnumerator(start?: number, count?: number): IContainerEnumerator {
            var carr = this._Containers;
            var iarr = this._Items;

            var index = (start || 0) - 1;
            var len = count == null ? carr.length : count;

            var i = 0;
            var e = { MoveNext: undefined, Current: undefined, CurrentItem: undefined, CurrentIndex: -1 };
            e.MoveNext = function () {
                i++;
                index++;
                e.CurrentIndex = index;
                if (i > len || index >= carr.length) {
                    e.Current = undefined;
                    e.CurrentItem = undefined;
                    return false;
                }
                e.Current = carr[index];
                e.CurrentItem = iarr[index];
                return true;
            };
            return e;
        }
    }

    export interface IContainerGenerator {
        IsCurrentNew: boolean;
        Current: UIElement;
        CurrentItem: any;
        CurrentIndex: number;
        GenerateIndex: number;
        Generate(): boolean;
    }
    export interface IContainerEnumerator extends IEnumerator<UIElement> {
        CurrentItem: any;
        CurrentIndex: number;
    }
}