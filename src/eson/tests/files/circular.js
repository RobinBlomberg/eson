(
  parent = {
    name: 'John',
  },
  child = {
    name: 'Elsa',
    parent,
  },
  parent.child = child,
  parent
)
