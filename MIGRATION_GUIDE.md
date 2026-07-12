# Vue 3 & Vuetify 3 Migration Guide

This guide helps migrate the remaining Vue components from Vue 2/Vuetify 2 to Vue 3/Vuetify 3.

## Quick Reference

### Component Name Changes

| Vuetify 2 | Vuetify 3 |
|-----------|-----------|
| `v-toolbar` | `v-toolbar` |
| `v-toolbar-side-icon` | `v-app-bar-nav-icon` |
| `v-toolbar-title` | `v-toolbar-title` |
| `v-content` | `v-main` |
| `v-navigation-drawer` | `v-navigation-drawer` |
| `v-list-tile` | `v-list-item` |
| `v-list-tile-avatar` | `v-list-item-avatar` (use `prepend-avatar` prop) |
| `v-list-tile-content` | `v-list-item-content` (use `title` prop) |
| `v-list-tile-title` | `v-list-item-title` (use `title` prop) |
| `v-list-tile-action` | `v-list-item-action` (use `append` slot) |
| `v-flex` | `v-col` |
| `v-layout` | `v-row` |
| `v-btn` | `v-btn` |
| `v-card` | `v-card` |
| `v-icon` | `v-icon` |

### Vue Syntax Changes

#### Vue 2 (Options API)
```javascript
export default {
  data() {
    return {
      count: 0
    };
  },
  computed: {
    doubleCount() {
      return this.count * 2;
    }
  },
  methods: {
    increment() {
      this.count++;
    }
  }
};
```

#### Vue 3 (Composition API)
```javascript
<script setup>
import { ref, computed } from 'vue';

const count = ref(0);
const doubleCount = computed(() => count.value * 2);

function increment() {
  count.value++;
}
</script>
```

#### Vue 3 (Options API - Still Supported)
```javascript
export default {
  data() {
    return {
      count: 0
    };
  },
  computed: {
    doubleCount() {
      return this.count * 2;
    }
  },
  methods: {
    increment() {
      this.count++;
    }
  }
};
```

## Store Migration (Vuex → Pinia)

### Vuex Store
```javascript
// store/index.js
export default new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment(state) {
      state.count++;
    }
  },
  actions: {
    increment({ commit }) {
      commit('increment');
    }
  }
});
```

### Pinia Store
```javascript
// stores/counter.js
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  actions: {
    increment() {
      this.count++;
    }
  }
});
```

### Using Pinia in Components
```javascript
<script setup>
import { useCounterStore } from '@/stores/counter';

const counter = useCounterStore();
counter.increment();
</script>
```

## Vuetify 3 Specific Changes

### Breakpoint System
```javascript
// Vuetify 2
this.$vuetify.breakpoint.smAndDown

// Vuetify 3
import { useDisplay } from 'vuetify';
const { smAndDown } = useDisplay();
```

### Theme Configuration
```javascript
// Vuetify 2
this.$vuetify.theme.currentTheme.primary = '#color'

// Vuetify 3
import { useTheme } from 'vuetify';
const theme = useTheme();
theme.global.name.value = 'dark';
```

## Migration Checklist

### For Each Component:

- [ ] Update template syntax (v-model changes, etc.)
- [ ] Replace Vuetify 2 components with Vuetify 3 equivalents
- [ ] Update breakpoint usage to use `useDisplay()`
- [ ] Replace `v-for` key syntax if needed
- [ ] Update event handlers
- [ ] Replace `v-if`/`v-show` logic if needed
- [ ] Update slot syntax
- [ ] Replace `$refs` with `ref()` in Composition API
- [ ] Update router usage (`$router` to `useRouter()`)
- [ ] Update store usage to Pinia

### Priority Components to Migrate:

1. **High Priority** (Core functionality):
   - [ ] `Player.vue` - Video player component
   - [ ] `Explorer.vue` - File explorer
   - [ ] `Home.vue` - Home page
   - [ ] `Search.vue` - Search functionality
   - [ ] `Movies.vue` - Movie listing

2. **Medium Priority** (Important features):
   - [ ] `MovieCard.vue` - Movie card component
   - [ ] `BookmarkButton.vue` - Bookmark functionality
   - [ ] `ShareButtons.vue` - Social sharing
   - [ ] `Bookmarks.vue` - Bookmarks page

3. **Low Priority** (Supporting features):
   - [ ] `About.vue` - About page
   - [ ] `NotFound.vue` - 404 page

## Example Migration

### Before (Vue 2 + Vuetify 2)
```vue
<template>
  <v-layout row>
    <v-flex xs12>
      <v-card>
        <v-card-title>{{ title }}</v-card-title>
        <v-card-text>{{ content }}</v-card-text>
        <v-btn @click="handleClick">Click me</v-btn>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data() {
    return {
      title: 'Hello',
      content: 'World'
    };
  },
  methods: {
    handleClick() {
      console.log('Clicked');
    }
  }
};
</script>
```

### After (Vue 3 + Vuetify 3)
```vue
<template>
  <v-row>
    <v-col cols="12">
      <v-card>
        <v-card-title>{{ title }}</v-card-title>
        <v-card-text>{{ content }}</v-card-text>
        <v-btn @click="handleClick">Click me</v-btn>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref } from 'vue';

const title = ref('Hello');
const content = ref('World');

function handleClick() {
  console.log('Clicked');
}
</script>
```

## Testing After Migration

After migrating each component:

1. **Visual Testing**: Check component renders correctly
2. **Functional Testing**: Test all interactions work
3. **Console Testing**: Check for errors/warnings
4. **Responsive Testing**: Test on different screen sizes
5. **Accessibility Testing**: Test keyboard navigation

## Common Issues and Solutions

### Issue: Component not rendering
**Solution**: Check if you're using `setup` script syntax correctly and all imports are resolved.

### Issue: Styling broken
**Solution**: Vuetify 3 uses different CSS classes. Check the Vuetify 3 documentation for updated class names.

### Issue: Events not firing
**Solution**: Vue 3 event syntax has changed slightly. Ensure you're using `@event-name` correctly.

### Issue: TypeScript errors
**Solution**: If using TypeScript, ensure you have proper type definitions for Vue 3 and Vuetify 3.

## Resources

- [Vue 3 Migration Guide](https://v3-migration.vuejs.org/)
- [Vuetify 3 Migration Guide](https://vuetifyjs.com/en/getting-started/upgrade-guide/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vue Router 4 Documentation](https://router.vuejs.org/)

## Support

If you encounter issues during migration:
1. Check official documentation
2. Search GitHub issues
3. Ask for help in community forums
4. Create a detailed issue report

---

**Note**: This migration guide covers the most common changes. Some components may require additional adjustments based on their specific functionality.