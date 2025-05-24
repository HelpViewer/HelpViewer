# ZIP File metadata files

## tree.lst

- This file stands for topics tree structure.
- Each line stands for one item here in tree.

e.g.:
```
[spaces, one per one sublevel, starts with no space for top level][Item name]|[Hyperlink bubble text]|[markdown relative path in zip file, path/subdir/aa.md format]

Ahoy|Bubble :)
//... will create topmost item with Ahoy caption and Bubble :) hint bubble content

 My program|DescText
//... will create subfolder with name My program and hint text DescText

  Main||my/main.md
//... will create another subitem with name Main, no hint bubble and linking to my/main.md file inside zip archive
```