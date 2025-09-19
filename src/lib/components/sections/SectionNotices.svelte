<script lang="ts">
  import { ChevronsRightIcon, InfoIcon } from '@lucide/svelte'
  import FailSafeContainer from '../layout/errors/FailSafeContainer.svelte'
  import SectionTitle from '../layout/SectionTitle.svelte'
  import NoticePrecipitation from './notices/NoticePrecipitation.svelte'
</script>

<!-- TODO: we need a way to only show this section and title when there are notices -->
<!-- <SectionTitle title="Notices" icon={InfoIcon} /> -->
<FailSafeContainer name="Section Notices" class="flex flex-row overflow-y-auto rounded-md">
  <NoticePrecipitation />
</FailSafeContainer>
