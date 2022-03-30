<script lang='ts'>

	import { createEventDispatcher, onMount, setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import PagerRecordsStore from '../types/PagerRecords.d.ts';
	import classnames from '../util/utils';
	import TableContainer from './TableContainer';
	import TableRow from './TableRow';
	import TableBody from './TableBody';
	import Table from './Table';
	import { buildPagerRecordsStore } from '../store/pagerRecords.store';
	import { apiPost } from '../api/axiosApi';
	import InlineCheckbox from '../input/InlineCheckbox.svelte';
	import Pagination from '../pagination/Pagination.svelte';
	import PaginationItem from '../pagination/PaginationItem.svelte';
	import PaginationLink from '../pagination/PaginationLink.svelte';
	import { buildShowColumns ,buildHeaderRows} from './table.util';

	let className = '';
	export { className as class };

	/** Set to `true` to use static width */
	export let useStaticWidth = false;

	/** Specify the title of the data table */
	export let title = "";

	/** Specify the description of the data table */
	export let description = "";

	/** Set to `true` for the sortable variant */
	export let sortable = false;

	/**
	 * Set to `true` for the expandable variant
	 * Automatically set to `true` if `batchExpansion` is `true`
	 */
	export let expandable = false;

	/**
	 * Set to `true` to enable batch expansion
	 */
	export let batchExpansion = false;

	/**
	 * Specify the row ids to be expanded
	 * @type {DataTableRowId[]}
	 */
	export let expandedRowIds = [];

	/**
	 * Specify the ids for rows that should not be expandable
	 * @type {DataTableRowId[]}
	 */
	export let nonExpandableRowIds = [];

	/** Set to `true` for the radio selection variant */
	export let radio = false;

	/**
	 * Set to `true` for the selectable variant
	 * Automatically set to `true` if `radio` or `batchSelection` are `true`
	 */
	export let selectable = false;

	/** Set to `true` to enable batch selection */
	export let batchSelection = false;

	/**
	 * Specify the row ids to be selected
	 * @type {DataTableRowId[]}
	 */
	export let selectedRowIds = [];
	/** Set to `pageSize` to enable pagination */
	export let pageSize = 0;//

	export let src: string;
	export let store: PagerRecordsStore = buildPagerRecordsStore({records:[],totalCount:0},{});
	export let contentHeight: number;
	export let columns = [];//列信息

	let dispatch = createEventDispatcher();
	const batchSelectedIds = writable([]);

	const sortHeader = writable({
		id: null,
		key: null,
		sort: undefined,
		sortDirection: "none",
	});

	const resolvePath = (object, path) =>
		path
			.split(/[.[\]'"]/)//.split(/[\.\[\]\'\"]/)
			.filter((p) => p)
			.reduce((o, p) => (o && typeof o === "object" ? o[p] : o), object);

	setContext("DataTable", {
		sortHeader,
		// tableSortable,
		batchSelectedIds,
		resetSelectedRowIds: () => {
			selectAll = false;
			selectedRowIds = [];
			if (refSelectAll) refSelectAll.checked = false;
		},
		addCol: (column) => {
			columns = [...columns,column];
		},
	});

	let container: HTMLDivElement;
	let pageIndex = 1;//当前页
	let expanded = false;

	let selectAll = false;
	let refSelectAll = null;

	$: batchSelectedIds.set(selectedRowIds);
	$: sortKey = $sortHeader.key;
	$: sorting = sortable && sortKey != null;

	/** 分组表头处理 */
	$: showColumns = buildShowColumns(columns);
	$: headerRows = buildHeaderRows(showColumns);

	$: headerKeys = showColumns.map(({ property }) => property);

	$: rows = $store.records.map((row) => ({
		...row,
		cells: headerKeys.map((key, index) => ({
			key,
			value: resolvePath(row, key)||'',
			type:showColumns[index].type,
			display: showColumns[index].display,
		})),
	}));

	$: indeterminate =
		selectedRowIds.length > 0 && selectedRowIds.length < rows.length;

	$: sortedRows = rows;

	$: expandableRowIds = rows
		.map((row) => row.id)
		.filter((id) => !nonExpandableRowIds.includes(id));

	$: if (radio || batchSelection) selectable = true;
	$: if(src && pageSize === 0) pageSize = 15;

	$: pagination = buildPagination($store.totalCount);

	$: classes = classnames(className, 'youi-data-table',headerRows.length>1?'table-group-header':'');
	/**
	 * 构建分页信息
	 * @param totalCount
	 */
	function buildPagination(totalCount){
		let items= [];
		let pageCount = Math.ceil(totalCount/pageSize);//总页数
		for(let i=0;i<pageCount;i++){
			items.push({index:i+1});
		}
		return {
			items:items,
			pageCount:pageCount
		};
	}

	/**
	 *
	 * @param record
	 */
	const handle_row_select = (record)=>{
		if(!batchSelection){
			if(selectedRowIds.includes(record.id)){
				selectedRowIds = [];
			}else{
				selectedRowIds = [record.id];
			}
		}
	};

	const _loadSrc = async ()=>{
		//
		if(src){
			//
			const result = await apiPost(src,'pager:pageIndex='+pageIndex);
			store.set(result);
		}
	}

	/**
	 *
	 * @param index
	 */
	function goPage(index){
		pageIndex = index;
		_loadSrc();
	}

	function goFirst() {
		if(pageIndex>1){
			pageIndex--;
			_loadSrc();
		}
	}

	function goNext(){
		if(pageIndex<pagination.pageCount){
			pageIndex++;
			_loadSrc();
		}
	}
	/**
	 *
	 */
	onMount(async () => {
		//
		await _loadSrc();
	});

</script>

<TableContainer class={classes}  useStaticWidth="{useStaticWidth}" {...$$restProps}>
	{#if title || $$slots.title || description || $$slots.description}
		<div class:data-table-header="{true}">
			{#if title || $$slots.title}
				<h4 class:data-table-header__title="{true}">
					<slot name="title">{title}</slot>
				</h4>
			{/if}
			{#if description || $$slots.description}
				<p class:data-table-header__description="{true}">
					<slot name="description">{description}</slot>
				</p>
			{/if}
		</div>
	{/if}
	<div class="table-filter-container">
		<slot/>
	</div>
	<Table>
		<thead>
			{#each headerRows as headerRow,rowIndex}
				<tr>
					{#if rowIndex==0}
						{#if batchSelection && !radio}
							<th scope="col" rowspan={headerRows.length} class:table-column-checkbox="{true}">
								<InlineCheckbox
									bind:ref="{refSelectAll}"
									aria-label="Select all rows"
									checked="{selectAll}"
									indeterminate="{indeterminate}"
									on:change="{(e) => {
									if (indeterminate) {
										e.target.checked = false;
										selectAll = false;
										selectedRowIds = [];
										return;
									}

									if (e.target.checked) {
										selectedRowIds = rows.map((row) => row.id);
									} else {
										selectedRowIds = [];
									}
								}}"
								/>
							</th>
						{/if}
					{/if}
					{#each headerRow.cells as cell}
						<th rowspan={cell.rowspan} colspan={cell.colspan}>{cell.text}</th>
					{/each}
				</tr>
			{/each}
		</thead>
<!--		<TableHeader>-->
<!--				{#if expandable}-->
<!--					<th-->
<!--						scope="col"-->
<!--						class:bx&#45;&#45;table-expand="{true}"-->
<!--						data-previous-value="{expanded ? 'collapsed' : undefined}"-->
<!--					>-->
<!--						{#if batchExpansion}-->
<!--							<button-->
<!--								type="button"-->
<!--								class:bx&#45;&#45;table-expand__button="{true}"-->
<!--								on:click="{() => {-->
<!--                  expanded = !expanded;-->
<!--                  expandedRowIds = expanded ? expandableRowIds : [];-->

<!--                  dispatch('click:header&#45;&#45;expand', { expanded });-->
<!--                }}"-->
<!--							>-->
<!--							</button>-->
<!--						{/if}-->
<!--					</th>-->
<!--				{/if}-->
<!--				{#if selectable && !batchSelection}-->
<!--					<th scope="col" style='width: 32px;'></th>-->
<!--				{/if}-->
<!--				{#if batchSelection && !radio}-->
<!--					<th scope="col" class:table-column-checkbox="{true}">-->
<!--						<InlineCheckbox-->
<!--							bind:ref="{refSelectAll}"-->
<!--							aria-label="Select all rows"-->
<!--							checked="{selectAll}"-->
<!--							indeterminate="{indeterminate}"-->
<!--							on:change="{(e) => {-->
<!--                if (indeterminate) {-->
<!--                  e.target.checked = false;-->
<!--                  selectAll = false;-->
<!--                  selectedRowIds = [];-->
<!--                  return;-->
<!--                }-->

<!--                if (e.target.checked) {-->
<!--                  selectedRowIds = rows.map((row) => row.id);-->
<!--                } else {-->
<!--                  selectedRowIds = [];-->
<!--                }-->
<!--              }}"-->
<!--						/>-->
<!--					</th>-->
<!--				{/if}-->


<!--		</TableHeader>-->
		<TableBody>
			{#each sorting ? sortedRows : rows as row, i (row.id)}
				<TableRow on:click={()=>handle_row_select(row)} class={selectedRowIds.includes(row.id)?'selected':''}>

					{#if selectable}
						<td
							class:bx--table-column-checkbox="{true}"
							class:bx--table-column-radio="{radio}"
						>
							{#if radio}

							{:else}
								<InlineCheckbox
									name="select-row-{row.id}"
									checked="{selectedRowIds.includes(row.id)}"
									on:change="{() => {
                    if (selectedRowIds.includes(row.id)) {
                      selectedRowIds = selectedRowIds.filter(
                        (id) => id !== row.id
                      );
                    } else {
                      selectedRowIds = [...selectedRowIds, row.id];
                    }
                  }}"
								/>
							{/if}
						</td>
					{/if}

					{#each row.cells as cell, j (cell.key)}
						<td>
							{#if cell.type==='button'}
								<slot name="cell_button" row="{row}" cell="{cell}">
								</slot>
							{:else if cell.type === 'menu'}
								<slot name="cell_menu" row="{row}" cell="{cell}">
								</slot>
							{:else if cell.type === 'link'}

							{:else if cell.type === 'date'}

							{:else }
								<slot name="cell" row="{row}" cell="{cell}">
									{cell.display ? cell.display(cell) : cell.value}
								</slot>
							{/if}
						</td>
					{/each}
				</TableRow>
			{/each}
		</TableBody>
	</Table>
	{#if pageSize>0}
		<Pagination ariaLabel="Page navigation example">
			<PaginationItem disabled={1===pageIndex}>
				<PaginationLink first href="javascript:void(0);"  on:click={() => goPage(1)}/>
			</PaginationItem>
			<PaginationItem disabled={1===pageIndex}>
				<PaginationLink previous href="javascript:void(0);"   on:click={goFirst}/>
			</PaginationItem>
			{#each pagination.items as item}
				<PaginationItem active={item.index === pageIndex} disabled={item.index === pageIndex} >
					<PaginationLink href="javascript:void(0);" on:click={() => goPage(item.index)}>{item.index}</PaginationLink>
				</PaginationItem>
			{/each}
			<PaginationItem disabled={pagination.pageCount === pageIndex}>
				<PaginationLink next href="javascript:void(0);"  on:click={goNext}/>
			</PaginationItem>
			<PaginationItem disabled={pagination.pageCount === pageIndex}>
				<PaginationLink last href="javascript:void(0);"  on:click={() => goPage(pagination.pageCount)}/>
			</PaginationItem>
		</Pagination>
	{/if}
</TableContainer>