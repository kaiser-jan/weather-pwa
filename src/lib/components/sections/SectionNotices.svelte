<script lang="ts">
  import FailSafeContainer from '../layout/errors/FailSafeContainer.svelte'
  import NoticePrecipitation from './notices/NoticePrecipitation.svelte'
  import { aggregableMetricGroupsStore } from '$lib/stores/aggregableMetricGroups'
</script>

<!-- 
TODO: create a system for notices:
- order by priority
- only show container if there are notices
- dismissible?
-->

<!-- <SectionTitle title="Notices" icon={InfoIcon} /> -->
<!-- <FailSafeContainer name="Section Notices" class="flex flex-row overflow-y-auto rounded-md"> -->
<NoticePrecipitation />
<!-- </FailSafeContainer> -->
