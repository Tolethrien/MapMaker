interface Shelf {
  y: number;
  height: number;
  xOffset: number;
  widthLeft: number;
}

export default class ShelfPack {
  private width: number;
  private height: number;
  private shelves: Shelf[];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.shelves = [];
  }

  insert(boxes: { box: Box2D; id: string }[]): { box: Box2D; id: string }[] {
    const packedBoxes: { box: Box2D; id: string }[] = [];
    for (let pack of boxes) {
      let placed = false;
      const box = pack.box;
      for (let shelf of this.shelves) {
        if (box.w <= shelf.widthLeft && box.h <= shelf.height) {
          box.x = shelf.xOffset;
          box.y = shelf.y;
          shelf.xOffset += box.w;
          shelf.widthLeft -= box.w;
          packedBoxes.push(pack);
          placed = true;
          break;
        }
      }
      if (!placed) {
        this.addShelf(pack, packedBoxes);
      }
    }
    return packedBoxes;
  }

  private addShelf(
    pack: { box: Box2D; id: string },
    packedBoxes: { box: Box2D; id: string }[]
  ) {
    const box = pack.box;
    if (this.height < box.h) return;
    let y =
      this.shelves.length > 0
        ? this.shelves[this.shelves.length - 1].y +
          this.shelves[this.shelves.length - 1].height
        : 0;
    if (y + box.h > this.height) return;
    const newShelf: Shelf = {
      y: y,
      height: box.h,
      xOffset: 0,
      widthLeft: this.width,
    };
    this.shelves.push(newShelf);
    box.x = newShelf.xOffset;
    box.y = newShelf.y;
    newShelf.xOffset += box.w;
    newShelf.widthLeft -= box.w;
    packedBoxes.push(pack);
  }
}
